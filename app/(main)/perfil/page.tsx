'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function PerfilPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  const handleSave = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          role: session.user.role,
        }),
      });
      if (!res.ok) throw new Error();
      await update({ name, email });
      toast.success('Perfil actualizado exitosamente');
    } catch {
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-2xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Cuenta</p>
        <h1 className="text-3xl font-bold text-stone-900">Mi perfil</h1>
        <p className="text-stone-500 text-sm mt-1">Actualiza tu información personal.</p>
      </div>

      {/* Avatar */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 rounded-xl bg-stone-800 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-stone-900 font-semibold text-lg">{name}</p>
          <p className="text-stone-400 text-sm">{session?.user?.role === 'ADMIN' ? 'Administrador' : 'Mesero'}</p>
        </div>
      </div>

      {/* Datos */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">Información personal</h2>
        <div className="space-y-1.5">
          <Label className="text-stone-700 text-sm font-medium">Nombre completo</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 border-stone-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-stone-700 text-sm font-medium">Correo electrónico</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 border-stone-200"
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-stone-900 hover:bg-stone-700 text-white h-10 px-6"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}