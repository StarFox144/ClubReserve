import apiClient from './client'

export const getMyBookings = () => apiClient.get('/bookings').then((r) => r.data)

export const createBooking = (computerId, startTime, endTime, promoCode) =>
  apiClient.post('/bookings', {
    computer_id: computerId,
    start_time: startTime,
    end_time: endTime,
    ...(promoCode ? { promo_code: promoCode } : {}),
  }).then((r) => r.data)

export const extendBooking = (id, hours) =>
  apiClient.post(`/bookings/${id}/extend`, { hours }).then((r) => r.data)

export const cancelBooking = (id) =>
  apiClient.delete(`/bookings/${id}`).then((r) => r.data)
