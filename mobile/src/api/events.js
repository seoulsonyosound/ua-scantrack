import { api } from "./client";
import { session } from "../session";

const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // 1. Add DRF Token to fix 401 Unauthorized
  if (session.token) {
    headers['Authorization'] = `Token ${session.token}`;
  }

  // 2. Add custom passcode to fix 403 Forbidden
  if (session.adminPasscode) {
    headers['X-ADMIN-PASSCODE'] = session.adminPasscode;
  }

  return { headers };
};

export async function listEvents() {
  const res = await api.get("/events/");
  return res.data;
}

export async function createEvent(payload) {
  // REMOVE getAuthHeaders() here. 
  // The interceptor in client.js is already doing this work!
  const res = await api.post("/events/", payload); 
  return res.data;
}

export async function validateEventPin(pin_code) {
  const res = await api.post("/events/validate_pin/", { pin_code });
  return res.data;
}


export async function updateEvent(id, payload) {
  const res = await api.patch(`/events/${id}/`, payload, getAuthHeaders());
  return res.data;
}

export async function deleteEvent(id) {
  const res = await api.delete(`/events/${id}/`, getAuthHeaders());
  return res.data;
}

