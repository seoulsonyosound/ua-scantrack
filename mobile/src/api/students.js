import { api } from "./client";

export async function listStudents() {
  const res = await api.get("/students/");
  return res.data;
}

export async function createStudent(payload) {
  // payload: {student_no, first_name, last_name, course, year_level}
  const res = await api.post("/students/", payload);
  return res.data;
}