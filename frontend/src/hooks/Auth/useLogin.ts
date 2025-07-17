import { useMutation } from '@tanstack/react-query';
import { api } from '../../utils/api';

export const useLogin = () =>
  useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await api('/admin/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      // Simpan token ke localStorage
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }
      return res;
    },
  }); 