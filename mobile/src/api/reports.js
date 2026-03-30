import { api } from "./client";

export async function downloadReportCsv(eventId) {
  const res = await api.get(`/events/${eventId}/report_csv/`, {
    headers: { Accept: "text/csv" },
    responseType: "text",
    transformResponse: (r) => r,
  });

  return typeof res.data === "string" ? res.data : String(res.data);
}

export async function downloadAttendeesCsv(eventId) {
  const res = await api.get(`/events/${eventId}/attendees_csv/`, {
    headers: { Accept: "text/csv" },
    responseType: "text",
    transformResponse: (r) => r,
  });

  return typeof res.data === "string" ? res.data : String(res.data);
}