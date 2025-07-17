import { useMutation } from '@tanstack/react-query';
import { api } from '../../utils/api';

export const useForgotPassword = () =>
  useMutation({
    mutationFn: async (data: { email: string }) => {
      return api('/admin/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  }); 