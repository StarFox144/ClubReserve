import apiClient from './client'

export const getClubs = () => apiClient.get('/clubs').then((r) => r.data)

export const getClub = (id) => apiClient.get(`/clubs/${id}`).then((r) => r.data)

export const getBusyComputers = (clubId) =>
  apiClient.get(`/clubs/${clubId}/busy-computers`).then((r) => r.data)

export const getAllClubsAdmin = () =>
  apiClient.get('/clubs/admin/all').then((r) => r.data)

export const createClub = (data) =>
  apiClient.post('/clubs', data).then((r) => r.data)

export const updateClub = (id, data) =>
  apiClient.put(`/clubs/${id}`, data).then((r) => r.data)

export const deleteClub = (id) => apiClient.delete(`/clubs/${id}`)
