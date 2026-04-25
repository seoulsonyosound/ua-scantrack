import { api } from "./client";
import { session } from "../session";

export async function scanCheckin({ pin_code, student_no }) {
  const res = await api.post("/attendance/scan_checkin/", { pin_code, student_no });
  return res.data;
}

export async function listAttendance() {
  const res = await api.get("/attendance/");
  return res.data;
}

export async function createAttendanceManual(payload) {
 
  const res = await api.post("/attendance/", payload);
  return res.data;
}

export async function deleteAttendance(attendanceId) {
  await api.delete(`/attendance/${attendanceId}/`, {
    headers: { "X-ADMIN-PASSCODE": session.adminPasscode },
  });
}