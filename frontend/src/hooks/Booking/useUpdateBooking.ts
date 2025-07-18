import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; room_id?: string; start_time?: string; end_time?: string; status?: string; purpose?: string }) =>
      api(`/bookings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}; 