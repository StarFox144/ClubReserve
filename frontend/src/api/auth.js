import apiClient from './client'

export const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password })
  return response.data
}

export const register = async (username, email, password) => {
  const response = await apiClient.post('/auth/register', { username, email, password })
  return response.data
}

export const refreshToken = async (refreshTokenStr) => {
  const response = await apiClient.post('/auth/refresh', null, {
    params: { refresh_token_str: refreshTokenStr },
  })
  return response.data
}
