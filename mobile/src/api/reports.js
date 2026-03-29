import { api } from "./client";

export async function downloadCsvByPin(pin_code) {
  // Axios will return string if responseType is "text" (default). We set headers explicitly.
  const res = await api.get(`/events/report_csv_by_pin/`, {
    params: { pin_code },
    headers: { Accept: "text/csv" },
    responseType: "text",
  });

  // Some servers might return it as a string; ensure it's a string.
  return typeof res.data === "string" ? res.data : String(res.data);
}