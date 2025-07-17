import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { 
      room_id: string;
      start_time: string; 
      end_time: string; 
      user_email: string; 
      user_name: string; 
      purpose: string; 
      attendees: number;
    }) =>
      api('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};