/*
 * All datetime string follows the ISO 8601 format (eg. `2025-01-01T00:00:00Z`).
 *
 * Use-case: Coffee-Chat
 *   Provides an time avaibility query endpoint, the frontend
 *   will use this API to limit the time range user can select.
 *
 *   Once time selected, frontend will request for an ics link and my
 *   calendar's email, which will opens user's calendar and add the event.
 *   (User will need to fill my email manually on their calendar App and so
 *   I can receive the invitation.)
 */

import { Hono } from "hono";
import { AppEnv } from "./env";
import {
  BusyPeriod,
  caldavClient,
  queryCalendarEvents,
  queryFreeBusy,
} from "./caldav";

const calendarApp = new Hono<AppEnv>();

/**
 * Only the public calendars' events.
 */
calendarApp.get("/events", async (c) => {
  const caldav_calendar_client = caldavClient(
    c.env.CALENDAR_URL,
    c.env.CALENDAR_USERNAME,
    c.env.CALENDAR_PASSWORD,
    c.env.CALENDAR_PUBLIC?.split(","),
  );

  return c.json(
    await queryCalendarEvents(
      caldav_calendar_client,
      new Date(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30d
    ),
    200,
  );
});

/**
 * Return a list of time ranges that I am busy.
 * (only the future 1 week)
 */
calendarApp.get("/free-busy", async (c) => {
  const caldav_calendar_client = caldavClient(
    c.env.CALENDAR_URL,
    c.env.CALENDAR_USERNAME,
    c.env.CALENDAR_PASSWORD,
  );
  return c.json(
    await queryFreeBusy(
      caldav_calendar_client,
      new Date(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7d
    ),
    200,
  );
});

/**
 * Get timezone
 */
calendarApp.get("/timezone", async (c) => {
  return c.json({
    timezone: c.env.CALENDAR_TIMEZONE,
  });
});

export default calendarApp;
