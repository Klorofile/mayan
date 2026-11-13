import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" }
});

// A single interceptor keeps token wiring consistent across every feature module.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("mayan.accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
