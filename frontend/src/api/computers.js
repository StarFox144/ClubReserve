import apiClient from './client'

export const getComputers = async (clubId) => {
  const params = clubId ? { club_id: clubId } : {}
  const response = await apiClient.get('/computers', { params })
  return response.data
}

export const getComputer = async (id) => {
  const response = await apiClient.get(`/computers/${id}`)
  return response.data
}

export const checkAvailability = async (id, startTime, endTime) => {
  const response = await apiClient.get(`/computers/${id}/availability`, {
    params: {
      start_time: startTime,
      end_time: endTime,
    },
  })
  return response.data
}
