// mobile/src/api/auth.js
import { api } from "./client";

export async function login(email, password) {
  const res = await api.post("/auth/login/", { email, password });
  return res.data; // {id,email,role,student_id}
}

export async function getStudentMe(email) {
  const res = await api.get("/students/me/", { params: { email } });
  return res.data;
}

export async function getMyAttendance(email) {
  const res = await api.get("/attendance/my/", { params: { email } });
  return res.data;
}