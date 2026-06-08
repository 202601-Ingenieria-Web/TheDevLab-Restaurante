'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Maestro {
  id: string;
  name: string;
  balance: number;
  unit: string;
  createdAt: string;
  user: { name: string };
}

export default function MaestrosPage() {
  const { data: session } = useSession();
  const [maestros, setMaestros] = useState<Maestro[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [unit, setUnit] = useState('kg');

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchMaestros();
  }, []);

  const fetchMaestros = async () => {
    try {
      const res = await fetch('/api/maestros');
      const data = await res.json();
      setMaestros(data.maestros || []);
    } catch (err) {
      console.error('Failed to fetch maestros', err);
    } finally {
      setFetching(false);
    }
  };

  const handleCreate = async () => {
    if (!name || !balance) return;
    setLoading(true);
    try {
      const res = await fetch('/api/maestros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          balance: parseFloat(balance),
          unit,
          userId: session?.user?.id || '',
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Ingrediente creado exitosamente');
      setOpen(false);
      setName('');
      setBalance('');
      setUnit('kg');
      fetchMaestros();
    } catch {
      toast.error('Error al crear el ingrediente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Inventario</p>
          <h1 className="text-3xl font-bold text-stone-900">Gestión de Inventario</h1>
          <p className="text-stone-500 text-sm mt-1">Administra los ingredientes y recursos disponibles.</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setOpen(true)}
            className="bg-stone-900 hover:bg-stone-700 text-white px-6 h-10 text-sm font-medium"
          >
            + Agregar ingrediente
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {fetching ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Total ingredientes</p>
              <p className="text-3xl font-bold text-stone-900">{maestros.length}</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Stock disponible</p>
              <p className="text-3xl font-bold text-green-700">{maestros.filter(m => m.balance > 0).length}</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Sin stock</p>
              <p className="text-3xl font-bold text-red-600">{maestros.filter(m => m.balance <= 0).length}</p>
            </div>
          </>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Ingrediente</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Stock actual</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Unidad</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Registrado por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {fetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-14 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-10" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                </tr>
              ))
            ) : maestros.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-stone-400 text-sm">
                  No hay ingredientes registrados en el inventario
                </td>
              </tr>
            ) : (
              maestros.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-stone-400">{m.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 font-semibold text-stone-900">{m.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      m.balance > 10
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                        : m.balance > 0
                        ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20'
                        : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                    }`}>
                      {m.balance}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-600">{m.unit}</td>
                  <td className="px-6 py-4 text-stone-600">{m.user?.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Diálogo */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-stone-900">Nuevo ingrediente</DialogTitle>
            <p className="text-stone-500 text-sm">Agrega un ingrediente al inventario de la cocina</p>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-stone-700 text-sm font-medium">Nombre del ingrediente</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Arroz, Pollo, Aceite..."
                className="h-10 border-stone-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-stone-700 text-sm font-medium">Stock inicial</Label>
                <Input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0"
                  className="h-10 border-stone-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-stone-700 text-sm font-medium">Unidad de medida</Label>
                <Select onValueChange={setUnit} defaultValue="kg">
                  <SelectTrigger className="h-10 border-stone-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                    <SelectItem value="lb">Libras (lb)</SelectItem>
                    <SelectItem value="lt">Litros (lt)</SelectItem>
                    <SelectItem value="und">Unidades (und)</SelectItem>
                    <SelectItem value="gr">Gramos (gr)</SelectItem>
                    <SelectItem value="ml">Mililitros (ml)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="border-stone-200 text-stone-600 h-10">
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={loading} className="bg-stone-900 hover:bg-stone-700 text-white h-10">
                {loading ? 'Creando...' : 'Crear ingrediente'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}