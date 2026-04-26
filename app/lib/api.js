import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({
  baseURL: API_URL,
})

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const loginAdmin = (credentials) => api.post('/admin/login', credentials)
export const loginVoluntario = (credentials) => api.post('/voluntario/login', credentials)
export const registerVoluntario = (data) => api.post('/voluntario/register', data)

// Abrigos
export const getAbrigos = () => api.get('/abrigos')
export const getAbrigo = (id) => api.get(`/abrigos/${id}`)
export const createAbrigo = (data) => api.post('/abrigos', data)
export const updateAbrigo = (id, data) => api.put(`/abrigos/${id}`, data)
export const deleteAbrigo = (id) => api.delete(`/abrigos/${id}`)

// Voluntários
export const getVoluntarios = () => api.get('/voluntarios')
export const updateVoluntarioStatus = (id, status) => api.put(`/voluntarios/${id}/status`, { status })

// Ocupação
export const updateOcupacao = (id, ocupados) => api.put(`/abrigos/${id}/ocupacao`, { ocupados })

// Resgates
export const criarResgate = (data) => api.post('/resgates', data)
export const getResgates = (status) => api.get('/resgates', { params: status ? { status } : {} })
export const aceitarResgate = (id) => api.put(`/resgates/${id}/status`, { status: 'a_caminho' })
export const concluirResgate = (id) => api.put(`/resgates/${id}/status`, { status: 'concluido' })
export const updateResgateStatus = (id, status) => api.put(`/resgates/${id}/status`, { status })
export const atualizarAudioResgate = (id, audio_url) => api.put(`/resgates/${id}/audio`, { audio_url })

export default api