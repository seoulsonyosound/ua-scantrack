export async function listUpcomingEvents() {
  const res = await api.get("/events/upcoming/");
  return res.data;
}