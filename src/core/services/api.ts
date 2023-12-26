import { createClient } from '@internal/sdk';
import axios from 'axios';
import nookies from 'nookies';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const sdk = createClient({
  axios: api
});

sdk.axiosInstance.interceptors.request.use((config) => {
  const cookies = nookies.get(null);
  const token = cookies ? cookies.session : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.request.use((config) => {
  const cookies = nookies.get(null);
  const token = cookies ? cookies.session : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { api, sdk };
