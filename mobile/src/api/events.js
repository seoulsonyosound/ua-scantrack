import { api } from "./client";
import { session } from "../session";




/**
 * Fetches all events from the backend.
 * Used by ManageEventsScreen and QuickScanScreen.
 */
export async function listEvents() {
  const res = await api.get("/events/");
  return res.data;
}

/**
 * Fetches details for a single event.
 */
export async function getEvent(eventId) {
  const res = await api.get(`/events/${eventId}/`);
  return res.data;
}

/**
 * Creates a new event. 
 * Requires admin passcode in headers.
 */
export async function createEvent(payload) {
  const res = await api.post("/events/", payload, {
    headers: { "X-ADMIN-PASSCODE": session.adminPasscode },
  });
  return res.data;
}

// src/api/events.js
export const updateEvent = async (id, data) => {
  return await api.patch(`/events/${id}/`, data); // PATCH instead of PUT
};
/**
 * Deletes an event from the backend.
 * Used by ManageEventsScreen.
 */
export const deleteEvent = async (id) => {
  return await api.delete(`/events/${id}/`, {
    headers: { 'X-ADMIN-PASSCODE': '1234' }
  });
};

/**
 * Validates an event PIN for student-admin check-in.
 */
export async function validateEventPin(pin_code) {
  const res = await api.post("/events/validate_pin/", { pin_code });
  return res.data;
}

// Admin CSV endpoints
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