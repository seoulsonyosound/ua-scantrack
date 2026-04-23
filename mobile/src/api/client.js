import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { session } from '../session';

export const api = axios.create({
  baseURL: 'http://192.168.254.155:8000/api',
});

api.interceptors.request.use(async (config) => {
  // Try memory first (fast), then storage (backup)
  const token = session.token || await AsyncStorage.getItem('userToken');
  
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  // Handle Admin Passcode for non-GET requests to /events/
  if (
  config.url?.includes("/events/") && 
  config.method?.toLowerCase() !== "get"
) {
  // Ensure this value is NOT undefined. It should be "1234"
  config.headers["X-ADMIN-PASSCODE"] = session.adminPasscode || "1234"; 
}

  return config;
}, (error) => Promise.reject(error));