import apiClient from './client'

export const getClubs = async () => {
  const response = await apiClient.get('/clubs')
  return response.data
}

export const getClub = async (id) => {
  const response = await apiClient.get(`/clubs/${id}`)
  return response.data
}
