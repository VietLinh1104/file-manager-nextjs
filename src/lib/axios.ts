// src/lib/axios.ts
import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log("[API REQUEST]", config.method?.toUpperCase(), api.getUri(config), "body:", config.data)
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("[API RESPONSE]", response.data)
    return response // 👈 giữ nguyên AxiosResponse
  },
  (error) => Promise.reject(error)
)

export default api
