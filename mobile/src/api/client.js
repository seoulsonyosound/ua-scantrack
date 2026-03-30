import axios from "axios";

export const api = axios.create({
  // Replace with your dev machine IP (same Wi‑Fi as phone), NOT localhost.
  // Example: http://192.168.1.10:8000/api
  baseURL: "http://192.168.100.172:8000/api", 
  timeout: 15000,
});