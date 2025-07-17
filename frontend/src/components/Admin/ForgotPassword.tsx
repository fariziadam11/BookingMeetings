import { useState } from 'react';
import { useForgotPassword } from '../../hooks/Auth/useForgotPassword';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword.mutate(
      { email },
      {
        onSuccess: () => {
          Swal.fire({
            icon: 'success',
            title: 'OTP Terkirim',
            text: 'Jika email terdaftar, kode OTP telah dikirim ke email Anda.',
            confirmButtonColor: '#2563eb',
          }).then(() => {
            window.location.href = '/admin/reset-password';
          });
        },
        onError: (error: any) => {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: error?.message || 'Gagal mengirim OTP',
            confirmButtonColor: '#d33',
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lupa Password Admin</CardTitle>
            <CardDescription>Masukkan email admin untuk menerima kode OTP reset password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email admin"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
                {forgotPassword.isPending ? 'Mengirim OTP...' : 'Kirim OTP'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword; 