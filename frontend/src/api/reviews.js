import apiClient from './client'

export const getReviews = (clubId) =>
  apiClient.get(`/clubs/${clubId}/reviews`).then((r) => r.data)

export const createReview = (clubId, data) =>
  apiClient.post(`/clubs/${clubId}/reviews`, data).then((r) => r.data)
