import axios from 'axios'
import router from '@/router'

// Detecta si estamos en entorno local
const hostname = location.hostname
const isLocal =
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname.endsWith('.localhost') ||
  hostname.endsWith('.test')

// Base URL:
// - PROD (subdominios reales): https://empresaX.midominio.com/api
// - DEV: mismo hostname pero puerto 8000 (php artisan serve)
const baseURL =
  import.meta.env.VITE_API_BASE_URL
  || (isLocal
        ? `${location.protocol}//${hostname}:8000/api`
        : `${location.origin}/api`)

const api = axios.create({
  baseURL,
  headers: { Accept: 'application/json' },
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // ---- Multitenant (solo dev / helpers) ----
  // 1) Si usas empresa1.localhost → X-Tenant: empresa1
  let tenant: string | null = null
  const parts = hostname.split('.')
  if (hostname.endsWith('.localhost') || hostname.endsWith('.test')) {
    // ej: empresa1.localhost → ["empresa1","localhost"]
    tenant = parts.length >= 2 ? parts[0] : null
  }
  // 2) Permite override por query (?tenant=empresa1) o env local (VITE_TENANT)
  tenant = new URLSearchParams(location.search).get('tenant') || tenant || (import.meta as any).env.VITE_TENANT || null

  if (tenant) {
    (config.headers as any)['X-Tenant'] = tenant
  }
  // ------------------------------------------

  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const redirect = router.currentRoute.value.fullPath
      router.push({ name: 'login', query: { redirect } })
    }
    return Promise.reject(err)
  }
)

export default api
