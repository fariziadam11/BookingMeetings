import { useMutation } from '@tanstack/react-query';
import { api } from '../../utils/api';

export const useResetPassword = () =>
  useMutation({
    mutationFn: async (data: { email: string; otp: string; new_password: string }) => {
      return api('/admin/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  }); 