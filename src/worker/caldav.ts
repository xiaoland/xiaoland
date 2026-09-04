import XMLBuilder from "fast-xml-builder";
import { XMLParser } from "fast-xml-parser";
import ICAL from "ical.js";

const DAV = "DAV:";
const CALDAV = "urn:ietf:params:xml:ns:caldav";
const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  suppressEmptyNode: true,
  format: true,
});
const xmlParser = new XMLParser();

/**
 * Calendar Event
 */
export type CalendarEvent = {
  id: string;
  title: string;
  /**
   * For timed event: ISO 8601 UTC; for all-day: YYYY-MM-DD
   */
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  description?: string;
};
function toCalendarEvents(ics: string): CalendarEvent[] {
  const calendar = new ICAL.Component(ICAL.parse(ics));

  for (const component of calendar.getAllSubcomponents("vtimezone")) {
    const tzid = component.getFirstPropertyValue("tzid");

    ICAL.TimezoneService.register(
      // @ts-ignore
      tzid,
      new ICAL.Timezone({
        tzid,
        component,
      }),
    );
  }

  return calendar
    .getAllSubcomponents("vevent")
    .map((component): CalendarEvent => {
      const event = new ICAL.Event(component);

      const start = event.startDate;
      const end = event.endDate;

      const recurrenceId = component.getFirstPropertyValue("recurrence-id");

      const id =
        recurrenceId instanceof ICAL.Time
          ? `${event.uid}:${recurrenceId.toString()}`
          : event.uid;

      return {
        id,
        title: event.summary ?? "",
        start: fromCaldavTime(start),
        end: fromCaldavTime(end),
        allDay: start.isDate,
        location: event.location ?? undefined,
        description: event.description ?? undefined,
      };
    });
}

/**
 *
 * @param url eg. `https://cal-dav-host/calendars/<username>`
 * @param calendars
 *  if given, request will be sent to all these calendar collection URL
 *  if not, request will be sent to calendar home
 */
export function caldavClient(
  url: string,
  username: string,
  password: string,
  calendars?: string[],
) {
  return (
    method: "REPORT" | "PROPFIND",
    body?: string,
    calendars_override?: string[],
  ) => {
    return Promise.allSettled(
      (calendars_override || calendars || [null]).map((i) => {
        let _url = url;
        if (i) {
          _url = `${url}/${i}`;
        }
        return fetch(_url, {
          method,
          headers: {
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
            Depth: "1",
            "Content-Type": "application/xml",
            Accept: "application/xml, text/xml",
          },
          body,
        });
      }),
    );
  };
}

function toCaldavTime(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}
function fromCaldavTime(time: ICAL.Time): string {
  if (time.isDate) {
    const year = String(time.year).padStart(4, "0");
    const month = String(time.month).padStart(2, "0");
    const day = String(time.day).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return time.toJSDate().toISOString();
}

/**
 *
 * @param start in format `YYYYMMDDTHHMMSSZ`, follows RFC 5545
 * @param end same as `start`
 */
export async function queryCalendarEvents(
  client: ReturnType<typeof caldavClient>,
  start: Date,
  end: Date,
): Promise<CalendarEvent[]> {
  const body = xmlBuilder.build({
    "c:calendar-query": {
      "@_xmlns:c": CALDAV,
      "@_xmlns:d": DAV,
      "d:prop": {
        "d:getetag": "",
        "c:calendar-data": "",
      },
      "c:filter": {
        "c:comp-filter": {
          "@_name": "VCALENDAR",
          "c:comp-filter": {
            "@_name": "VEVENT",
            "c:time-range": {
              "@_start": toCaldavTime(start),
              "@_end": toCaldavTime(end),
            },
          },
        },
      },
    },
  });

  const responses = await client("REPORT", body);
  return (
    await Promise.all(
      responses
        .filter((r) => r.status === "fulfilled")
        .flatMap(async ({ value: response }) => {
          if (!response.ok) {
            return [];
          }
          const text = await response.text();

          try {
            const icsResponses = xmlParser
              .parse(text)
              ["d:multistatus"]["d:response"].map((i: any) => {
                return i["d:propstat"]["d:prop"]["cal:calendar-data"];
              });
            return icsResponses.flatMap(toCalendarEvents);
          } catch {
            return [];
          }
        }),
    )
  ).flat();
}

async function getAllCalendars(
  client: ReturnType<typeof caldavClient>,
): Promise<string[]> {
  const body = xmlBuilder.build({
    "d:propfind": {
      "@_xmlns:d": DAV,
      "@_xmlns:cal": CALDAV,
      "d:prop": {
        // displayname is not a stable identical for collection URL
        "d:displayname": "",
        "d:resourcetype": "",
        "cal:schedule-calendar-transp": "",
      },
    },
  });
  const responses = await client("PROPFIND", body);
  return (
    await Promise.all(
      responses
        .filter((r) => r.status === "fulfilled")
        .flatMap(async ({ value: response }) => {
          const text = await response.text();
          if (!response.ok) {
            return [];
          }
          return xmlParser
            .parse(text)
            ["d:multistatus"]["d:response"].map((i: any) => {
              const prop = i["d:propstat"]["d:prop"];
              if (
                prop &&
                prop["cal:schedule-calendar-transp"] &&
                prop["cal:schedule-calendar-transp"].hasOwnProperty(
                  "cal:opaque",
                )
              ) {
                if (prop["d:displayname"]) {
                  return prop["d:displayname"].toLowerCase();
                }
              }
              return [];
            })
            .flat();
        }),
    )
  ).flat();
}

export type BusyPeriod = {
  start: string;
  end: string;
  type: "BUSY" | "BUSY-TENTATIVE" | "BUSY-UNAVAILABLE";
};

/**
 */
export async function queryFreeBusy(
  client: ReturnType<typeof caldavClient>,
  start: Date,
  end: Date,
): Promise<BusyPeriod[]> {
  const body = xmlBuilder.build({
    "cal:free-busy-query": {
      "@_xmlns:cal": CALDAV,
      "cal:time-range": {
        "@_start": toCaldavTime(start),
        "@_end": toCaldavTime(end),
      },
    },
  });
  const all_calendars = await getAllCalendars(client);
  const responses = await client("REPORT", body, all_calendars);
  return (
    await Promise.all(
      responses
        .filter((r) => r.status === "fulfilled")
        .flatMap(async ({ value: response }) => {
          if (!response.ok) {
            return [];
          }
          const calendar = new ICAL.Component(
            ICAL.parse(await response.text()),
          );

          const freebusy = calendar.getFirstSubcomponent("vfreebusy");
          if (!freebusy) {
            return [];
          }
          const result: BusyPeriod[] = [];
          for (const property of freebusy.getAllProperties("freebusy")) {
            const type = (
              property.getFirstParameter("fbtype") ?? "BUSY"
            ).toUpperCase();

            if (type === "FREE") {
              continue;
            }

            for (const period of property.getValues()) {
              result.push({
                start: period.start.toJSDate().toISOString(),
                end: period.getEnd().toJSDate().toISOString(),
                type: type as BusyPeriod["type"],
              });
            }
          }

          return result;
        }),
    )
  ).flat();
}
