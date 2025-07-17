import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';

export const useBookings = (params?: { page?: number; limit?: number; room_id?: string; id?: string; status?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => api(`/bookings?${query ? query : ''}`),
  });
};