import apiClient from './client'

export const getComputers = (clubId, includeInactive = false) => {
  const params = {}
  if (clubId) params.club_id = clubId
  if (includeInactive) params.include_inactive = true
  return apiClient.get('/computers', { params }).then((r) => r.data)
}

export const getComputer = (id) =>
  apiClient.get(`/computers/${id}`).then((r) => r.data)

export const checkAvailability = (id, startTime, endTime) =>
  apiClient
    .get(`/computers/${id}/availability`, { params: { start_time: startTime, end_time: endTime } })
    .then((r) => r.data)

export const getAllComputersAdmin = (clubId) => {
  const params = clubId ? { club_id: clubId } : {}
  return apiClient.get('/computers/admin/all', { params }).then((r) => r.data)
}

export const createComputer = (data) =>
  apiClient.post('/computers', data).then((r) => r.data)

export const updateComputer = (id, data) =>
  apiClient.put(`/computers/${id}`, data).then((r) => r.data)

export const deleteComputer = (id) => apiClient.delete(`/computers/${id}`)
