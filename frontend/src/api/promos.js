import apiClient from './client'

export const validatePromo = (code) =>
  apiClient.post('/promos/validate', { code }).then((r) => r.data)

export const getPromos = () => apiClient.get('/promos').then((r) => r.data)

export const createPromo = (data) => apiClient.post('/promos', data).then((r) => r.data)

export const togglePromo = (id) => apiClient.patch(`/promos/${id}/toggle`).then((r) => r.data)
