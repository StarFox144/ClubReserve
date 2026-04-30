import apiClient from './client'

export const getMe = () => apiClient.get('/users/me').then((r) => r.data)

export const updateMe = (data) => apiClient.put('/users/me', data).then((r) => r.data)

export const getAllUsersAdmin = () => apiClient.get('/users/admin/all').then((r) => r.data)

export const toggleUserAdmin = (id) =>
  apiClient.patch(`/users/${id}/toggle-admin`).then((r) => r.data)

export const toggleUserActive = (id) =>
  apiClient.patch(`/users/${id}/toggle-active`).then((r) => r.data)
