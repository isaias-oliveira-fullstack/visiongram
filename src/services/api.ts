import axios, { AxiosHeaders } from 'axios'
import type { AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? window.location.origin

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers = AxiosHeaders.from(config.headers).set('Authorization', `Bearer ${token}`)
  }

  // Requisição preparada

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    // Erro de resposta capturado
    if (status === 401 || status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

export default api
