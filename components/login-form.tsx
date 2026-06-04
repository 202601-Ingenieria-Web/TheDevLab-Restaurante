'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Credenciales incorrectas');
      } else {
        router.push('/transacciones');
      }
    } catch {
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)} {...props}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-stone-600 text-sm font-medium">
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@restaurante.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 border-stone-200 rounded-none focus:border-amber-500 focus:ring-0 bg-stone-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-stone-600 text-sm font-medium">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 border-stone-200 rounded-none focus:border-amber-500 focus:ring-0 bg-stone-50"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-stone-800 hover:bg-amber-600 text-white font-medium tracking-wide rounded-none transition-colors duration-200 mt-2"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>
    </div>
  );
}