import { api } from "./client";
import { session } from "../session";

export async function listEvents() {
  const res = await api.get("/events/");
  return res.data;
}

export async function getEvent(eventId) {
  const res = await api.get(`/events/${eventId}/`);
  return res.data;
}

export async function createEvent(payload) {
  const res = await api.post("/events/", payload, {
    headers: { "X-ADMIN-PASSCODE": session.adminPasscode },
  });
  return res.data;
}

export async function validateEventPin(pin_code) {
  const res = await api.post("/events/validate_pin/", { pin_code });
  return res.data;
}

// Admin CSV endpoints (backend you added)
export async function downloadEventAttendanceCsv(eventId) {
  const res = await api.get(`/events/${eventId}/report_csv/`, {
    headers: { Accept: "text/csv" },
    responseType: "text",
  });
  return typeof res.data === "string" ? res.data : String(res.data);
}

export async function downloadEventAttendeesCsv(eventId) {
  const res = await api.get(`/events/${eventId}/attendees_csv/`, {
    headers: { Accept: "text/csv" },
    responseType: "text",
  });
  return typeof res.data === "string" ? res.data : String(res.data);
}