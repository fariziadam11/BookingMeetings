import { useState } from 'react';
import { useRegister } from '../../hooks/Auth/useRegister';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import Swal from 'sweetalert2';

const AdminRegister = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const register = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(
      { email, username, password },
      {
        onError: (error: any) => {
          const msg = (error?.message || '').toLowerCase();
          if (
            error?.status === 401 ||
            error?.status === 403 ||
            msg.includes('unauthorized') ||
            msg.includes('invalid token') ||
            msg.includes('authorization') ||
            msg.includes('forbidden')
          ) {
            Swal.fire({
              icon: 'error',
              title: 'Tidak Diizinkan',
              text: 'Anda tidak memiliki izin untuk menambah admin.',
              confirmButtonColor: '#d33',
            });
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <img src="/img/gis.png" alt="Admin Icon" className="h-14 w-14" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Register Admin</h1>
          <p className="text-muted-foreground">
            Tambahkan admin baru untuk dashboard
          </p>
        </div>

        {/* Register Form */}
        <Card>
          <CardHeader>
            <CardTitle>Register New Admin</CardTitle>
            <CardDescription>
              Masukkan username dan password admin baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Nama Pengguna"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Kata Sandi"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {register.isSuccess && (
                <div className="p-3 bg-green-100 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">Registrasi admin berhasil!</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={register.isPending}>
                {register.isPending ? 'Sedang mendaftar...' : 'Daftar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRegister;