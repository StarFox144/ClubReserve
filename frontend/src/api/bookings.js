import apiClient from './client'

export const getMyBookings = async () => {
  const response = await apiClient.get('/bookings')
  return response.data
}

export const createBooking = async (computerId, startTime, endTime) => {
  const response = await apiClient.post('/bookings', {
    computer_id: computerId,
    start_time: startTime,
    end_time: endTime,
  })
  return response.data
}

export const cancelBooking = async (id) => {
  const response = await apiClient.delete(`/bookings/${id}`)
  return response.data
}
