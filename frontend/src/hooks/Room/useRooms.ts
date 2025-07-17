import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';

export const useRooms = (params?: { page?: number; limit?: number; name?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  return useQuery({
    queryKey: ['rooms', params],
    queryFn: () => api(`/rooms?${query ? query : ''}`),
  });
}; 