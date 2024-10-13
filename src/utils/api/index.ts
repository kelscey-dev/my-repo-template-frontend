import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY },
  withCredentials: true,
  timeout: 5000,
  // signal: AbortSignal.timeout(5000),
});

export default apiClient;
