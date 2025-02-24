import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Your Next.js API base URL

const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token"); // Get token from localStorage
    }
    return null;
};

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach Token to Every Request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn("⚠️ No token found! Authentication will fail.");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
