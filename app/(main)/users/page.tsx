'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('USER');

  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/transacciones');
    }
  }, [session]);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data.users || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setRole(user.role);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      toast.success('Rol actualizado exitosamente');
      setEditOpen(false);
      fetchUsers();
    } catch {
      toast.error('Error al actualizar el rol');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName || !newEmail || !newPassword) return;
    setCreateLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Error al crear usuario');
        return;
      }
      toast.success('Usuario creado exitosamente');
      setCreateOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('USER');
      fetchUsers();
    } catch {
      toast.error('Error al crear usuario');
    } finally {
      setCreateLoading(false);
    }
  };

  const admins = users.filter(u => u.role === 'ADMIN').length;
  const meseros = users.filter(u => u.role === 'USER').length;

  return (
    <div className="p-8 w-full space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Administración</p>
          <h1 className="text-3xl font-bold text-stone-900">Administración de Usuarios</h1>
          <p className="text-stone-500 text-sm mt-1">Gestiona roles y permisos del sistema.</p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-stone-900 hover:bg-stone-700 text-white px-6 h-10 text-sm font-medium"
        >
          + Crear mesero
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Total usuarios</p>
          <p className="text-3xl font-bold text-stone-900">{users.length}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Administradores</p>
          <p className="text-3xl font-bold text-amber-600">{admins}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Meseros</p>
          <p className="text-3xl font-bold text-blue-600">{meseros}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Correo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Fecha creación</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-stone-400 text-sm">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-stone-400">{u.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 font-semibold text-stone-900">{u.name}</td>
                  <td className="px-6 py-4 text-stone-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'ADMIN'
                        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                        : 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                    }`}>
                      {u.role === 'ADMIN' ? 'Administrador' : 'Mesero'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-500 text-sm">
                    {new Date(u.createdAt).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(u)}
                      className="text-xs text-stone-600 hover:text-stone-900 font-medium underline-offset-2 hover:underline"
                    >
                      Editar rol
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal editar rol */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-stone-900">Editar rol</DialogTitle>
            <p className="text-stone-500 text-sm">{selectedUser?.email}</p>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-stone-700 text-sm font-medium">Rol</Label>
              <Select onValueChange={setRole} value={role}>
                <SelectTrigger className="h-10 border-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="USER">Mesero</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)} className="border-stone-200 text-stone-600 h-10">
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={editLoading} className="bg-stone-900 hover:bg-stone-700 text-white h-10">
                {editLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal crear usuario */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-stone-900">Crear mesero</DialogTitle>
            <p className="text-stone-500 text-sm">Agrega un nuevo miembro al equipo</p>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-stone-700 text-sm font-medium">Nombre completo</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="h-10 border-stone-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-stone-700 text-sm font-medium">Correo electrónico</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="correo@restaurante.com"
                className="h-10 border-stone-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-stone-700 text-sm font-medium">Contraseña</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 border-stone-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-stone-700 text-sm font-medium">Rol</Label>
              <Select onValueChange={setNewRole} value={newRole}>
                <SelectTrigger className="h-10 border-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Mesero</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="border-stone-200 text-stone-600 h-10">
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={createLoading} className="bg-stone-900 hover:bg-stone-700 text-white h-10">
                {createLoading ? 'Creando...' : 'Crear usuario'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}