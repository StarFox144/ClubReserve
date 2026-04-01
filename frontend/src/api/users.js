import apiClient from './client'

export const getMe = async () => {
  const response = await apiClient.get('/users/me')
  return response.data
}

export const updateMe = async (data) => {
  const response = await apiClient.put('/users/me', data)
  return response.data
}
