import apiClient from './client'

export const getAdminStats = () => apiClient.get('/admin/stats').then((r) => r.data)
export const getAllReviewsAdmin = () => apiClient.get('/admin/reviews').then((r) => r.data)
export const deleteReviewAdmin = (id) => apiClient.delete(`/admin/reviews/${id}`).then((r) => r.data)
export const getAllBookingsAdmin = () => apiClient.get('/admin/bookings').then((r) => r.data)
