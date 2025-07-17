import { useMutation } from '@tanstack/react-query';
import { api } from '../../utils/api';

export const useRegister = () =>
  useMutation({
    mutationFn: async (data: { email: string; username: string; password: string }) => {
      return api('/admin/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  }); 