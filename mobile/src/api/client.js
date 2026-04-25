import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { session } from '../session';

export const api = axios.create({
  baseURL: 'http://192.168.254.155:8000/api',
});

api.interceptors.request.use(async (config) => {
 
  const token = session.token || await AsyncStorage.getItem('userToken');
  
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }


  if (
  config.url?.includes("/events/") && 
  config.method?.toLowerCase() !== "get"
) {
  
  config.headers["X-ADMIN-PASSCODE"] = session.adminPasscode || "1234"; 
}

  return config;
}, (error) => Promise.reject(error));