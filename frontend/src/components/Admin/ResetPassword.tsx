import { useState } from 'react';
import { useResetPassword } from '../../hooks/Auth/useResetPassword';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import Swal from 'sweetalert2';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const resetPassword = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetPassword.mutate(
      { email, otp, new_password: newPassword },
      {
        onSuccess: () => {
          Swal.fire({
            icon: 'success',
            title: 'Password Berhasil Direset',
            text: 'Silakan login dengan password baru.',
            confirmButtonColor: '#2563eb',
          }).then(() => {
            window.location.href = '/admin/login';
          });
        },
        onError: (error: any) => {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: error?.message || 'Gagal reset password',
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
            <CardTitle>Reset Password Admin</CardTitle>
            <CardDescription>Masukkan email, kode OTP, dan password baru Anda.</CardDescription>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Kode OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Masukkan kode OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Password baru"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
                {resetPassword.isPending ? 'Menyimpan...' : 'Reset Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword; 