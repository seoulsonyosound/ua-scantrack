import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { session } from '../session';

export const api = axios.create({
  baseURL: 'http://192.168.254.155:8000/api',
});

api.interceptors.request.use(async (config) => {
  try {
    let token = await AsyncStorage.getItem('userToken');
    console.log("TOKEN SAVED RIGHT AFTER LOGIN:", token);
    if (!token && typeof window !== "undefined" && window.localStorage) {
      token = window.localStorage.getItem('userToken');
    }
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    // Add passcode header for admin events (PATCH, POST, PUT, DELETE)
    if (
      config.url &&
      config.url.includes("/events/") && // <-- this matches "/events/41/" correctly!
      config.method && config.method.toLowerCase() !== "get"
    ) {
      config.headers["X-ADMIN-PASSCODE"] = session.adminPasscode;
    }
    // Log headers and info
    console.log(
      "[UPDATE EVENT] SENDING HEADERS:",
      config.headers,
      "URL:",
      config.url,
      "METHOD:",
      config.method
    );
    return config;
  } catch (e) {
    console.error("Token Load Error", e);
    return config;
  }
}, (error) => {
  return Promise.reject(error);
});