import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description: string; capacity: number }) =>
      api('/rooms', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}; 