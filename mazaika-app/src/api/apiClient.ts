import axios from 'axios'

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  if (typeof window !== 'undefined' && window.location.hostname.includes('pages.dev')) {
    return 'https://mazaika.onrender.com'
  }
  return 'http://localhost:3000'
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  }
})
