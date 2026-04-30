import apiClient from './client'

export const getAdminStats = () => apiClient.get('/admin/stats').then((r) => r.data)
