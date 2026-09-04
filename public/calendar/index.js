import { localizeTimes } from "../base.js";

const container = document.querySelector("#event-list");

async function loadEvents() {
  const response = await fetch("/api/calendar/events");

  if (!response.ok) {
    throw new Error("Failed to load events");
  }

  const events = await response.json();
  events.sort(
    (a,b) => new Date(a.start) - new Date(b.start)
  )

  renderEvents(events);
}

/**
 *
 * @param {*} events will render in order (asdc)
 */
function renderEvents(events) {
  container.replaceChildren();

  for (const event of events) {
    const article = document.createElement("article");

    const title = document.createElement("h2");
    title.textContent = event.title;
    article.append(title);

    // metadata
    const metadata = document.createElement("div");
    metadata.id = "metadata";
    //   time
    let time;
    if (event.allDay) {
      time = document.createElement("time");
      time.classList.add("localized", "date");
      time.dateTime = event.start;
      time.textContent = event.start;
    } else {
      time = document.createElement("div");
      time.id = "time";
      const startTime = document.createElement("time");
      const endTime = document.createElement("time");
      startTime.classList.add("localized", "datetime");
      endTime.classList.add("localized", "time");
      startTime.dateTime = event.start;
      endTime.dateTime = event.end;
      startTime.textContent = event.start;
      endTime.textContent = event.end;
      time.append('🕐 ', startTime, ' - ', endTime);
    }
    metadata.append(time);

    //   location
    if (event.location) {
      const location = document.createElement("p");
      location.id = "location";
      location.textContent = `📍 ${event.location}`;
      metadata.append(location);
    }

    article.append(metadata);

    // detail
    const detail = document.createElement("div");
    detail.id = 'detail';
    //   description
    if (event.description) {
      const description = document.createElement("p");
      description.id = "description";
      description.textContent = event.description;
      description.style.whiteSpace = "pre-wrap";
      detail.append(description);
    }

    article.append(detail);

    container.append(article);
  }

  localizeTimes();
}

loadEvents().catch((error) => {
  console.error(error);
  container.textContent = "Failed to load events.";
});

export async function getTimezone() {
  const response = await fetch('/api/calendar/timezone');
  return (await response.json()).timezone;
}


// CoffeeChat
const workStart = "10:00";
const workEnd = "22:00";
const timezone = await getTimezone();

function toIcsDate(instant) {
  return instant
    .toString({ smallestUnit: "second" })
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".000", "");
}

async function getCoffeeChatSlots(date, duration) {
  const response = await fetch('/api/calendar/free-busy');
  const busy = (await response.json()).map(({ start, end }) => ({
    start: Temporal.Instant.from(start),
    end: Temporal.Instant.from(end),
  }));

  const day = Temporal.PlainDate.from(date);
  let cursor = day.toZonedDateTime({
    timeZone: timezone,
    plainTime: workStart,
  });
  let windowEnd = day.toZonedDateTime({
    timeZone: timezone,
    plainTime: workEnd,
  });

  // ["HH:MM", "HH:MM"]
  const slots = [];

  while (Temporal.ZonedDateTime.compare(cursor, windowEnd) < 0) {
    const next = cursor.add({ minutes: duration });
    if (Temporal.ZonedDateTime.compare(next, windowEnd) > 0) {
      break;
    }

    const slotStart = cursor.toInstant();
    const slotEnd = next.toInstant();
    const isBusy = busy.some(({ start, end }) =>
      Temporal.Instant.compare(slotStart, end) < 0 &&
      Temporal.Instant.compare(slotEnd, start) > 0
    );

    if (!isBusy) {
      slots.push({
        start: cursor.toPlainTime().toString({ smallestUnit: 'minute' }),
        end: next.toPlainTime().toString({ smallestUnit: 'minute' }),
      });
    }

    cursor = next;
  }

  return slots;
}

export async function loadCoffeeChatSlots(date) {
  const slotSelect = document.querySelector('#coffee-chat-slot');
  const slots = await getCoffeeChatSlots(date, 30);
  slotSelect.replaceChildren(...slots.map((slot) => {
    const slotElement = document.createElement('option');
    slotElement.textContent = `${slot.start} - ${slot.end}`;
    return slotElement;
  }));
};

const state = {
    selectedDate: null,
    selectedSlot: null,
};
const input = document.querySelector("#coffee-chat-date");
const today = Temporal.Now.plainDateISO();
state.selectedDate = today;
input.min = today.toString();
input.max = today.add({ days: 7 }).toString();
input.value = today.toString();

input.addEventListener("change", () => {
    state.selectedDate = Temporal.PlainDate.from(input.value);
    state.selectedSlot = null;
    loadCoffeeChatSlots(state.selectedDate);
});

loadCoffeeChatSlots(state.selectedDate);

const coffeeChatForm = document.querySelector("#coffee-chat form");
coffeeChatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(coffeeChatForm);
  const date = data.get("date")
  const [startTime, endTime] = data.get("time").split(" - ");

  const start = Temporal.PlainDate
    .from(date)
    .toZonedDateTime({
      timeZone: timezone,
      plainTime: startTime,
    })
    .toInstant();

  const end = Temporal.PlainDate
    .from(date)
    .toZonedDateTime({
      timeZone: timezone,
      plainTime: endTime,
    })
    .toInstant();

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//lanzhijiang.dev//Coffee Chat//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@lanzhijiang.dev`,
    `DTSTAMP:${toIcsDate(Temporal.Now.instant())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    "SUMMARY:Coffee Chat with Lanzhijiang",
    // Will need to retrive user address from CalDAV
    "DESCRIPTION:Add lanzhijiang@foxmail.com as a guest and send the invitation.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], {
    type: "text/calendar;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "coffee-chat.ics";
  link.click();

  URL.revokeObjectURL(url);
});
