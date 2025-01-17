import axios from 'axios';

const API_URL =
    typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_BUILD_API_URL // Build time
        : process.env.NEXT_PUBLIC_API_URL; // Runtime

const axiosInstance = axios.create({
    baseURL: API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

export default axiosInstance;