import axios from 'axios';
import nookies from 'nookies';

// Create an axios instance
const api = axios.create({
    baseURL: 'http://localhost:3061',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to add Authorization header before each request is sent
api.interceptors.request.use((config) => {
    // Get token from cookies
    const cookies = nookies.get(null);
    const token = cookies ? cookies.session : null;

    // Add Authorization header if token is available
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export { api };
