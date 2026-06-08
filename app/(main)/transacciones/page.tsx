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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Maestro {
  id: string;
  name: string;
  balance: number;
  unit: string;
}

interface Movimiento {
  id: string;
  type: string;
  quantity: number;
  createdAt: string;
  user: { name: string };
}

export default function TransaccionesPage() {
  const { data: session } = useSession();
  const [maestros, setMaestros] = useState<Maestro[]>([]);
  const [selectedMaestro, setSelectedMaestro] = useState<string>('');
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchingMovimientos, setFetchingMovimientos] = useState(false);
  const [type, setType] = useState<string>('ENTRADA');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    const fetchMaestros = async () => {
      const res = await fetch('/api/maestros');
      const data = await res.json();
      setMaestros(data.maestros || []);
      setFetching(false);
    };
    fetchMaestros();
  }, []);

  useEffect(() => {
    if (!selectedMaestro) return;
    const fetchMovimientos = async () => {
      setFetchingMovimientos(true);
      const res = await fetch(`/api/movimientos?maestroId=${selectedMaestro}`);
      const data = await res.json();
      setMovimientos(data.movimientos || []);
      setFetchingMovimientos(false);
    };
    fetchMovimientos();
  }, [selectedMaestro]);

  const handleCreate = async () => {
    if (!quantity || !selectedMaestro) return;
    setLoading(true);
    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          quantity: parseFloat(quantity),
          maestroId: selectedMaestro,
          userId: session?.user?.id || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Error al crear el movimiento');
        return;
      }
      toast.success('Movimiento creado exitosamente');
      setOpen(false);
      setQuantity('');
      const res2 = await fetch(`/api/movimientos?maestroId=${selectedMaestro}`);
      const data2 = await res2.json();
      setMovimientos(data2.movimientos || []);
    } catch {
      toast.error('Error al crear el movimiento');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [...movimientos]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .reduce((acc: { fecha: string; entradas: number; salidas: number }[], mov) => {
      const date = new Date(mov.createdAt);
      const fecha = `${date.getDate()}/${date.getMonth() + 1}`;
      const existing = acc.find((d) => d.fecha === fecha);
      if (existing) {
        if (mov.type === 'ENTRADA') existing.entradas += mov.quantity;
        else existing.salidas += mov.quantity;
      } else {
        acc.push({
          fecha,
          entradas: mov.type === 'ENTRADA' ? mov.quantity : 0,
          salidas: mov.type === 'SALIDA' ? mov.quantity : 0,
        });
      }
      return acc;
    }, []);

  const maestroSeleccionado = maestros.find((m) => m.id === selectedMaestro);

  return (
    <div className="p-8 w-full space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Inventario</p>
          <h1 className="text-3xl font-bold text-stone-900">Gestión de Transacciones</h1>
          <p className="text-stone-500 text-sm mt-1">Administra los movimientos del inventario del restaurante.</p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          disabled={!selectedMaestro}
          className="bg-stone-900 hover:bg-stone-700 text-white px-6 h-10 text-sm font-medium"
        >
          + Agregar movimiento
        </Button>
      </div>

      {/* Dropdown */}
      <div className="w-80">
        <Label className="text-stone-600 text-xs font-semibold uppercase tracking-wider mb-2 block">
          Seleccionar ingrediente
        </Label>
        {fetching ? (
          <Skeleton className="h-10 w-full rounded-md" />
        ) : (
          <Select onValueChange={setSelectedMaestro}>
            <SelectTrigger className="h-10 border-stone-200 bg-white">
              <SelectValue placeholder="Selecciona un ingrediente..." />
            </SelectTrigger>
            <SelectContent>
              {maestros.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} — {m.balance} {m.unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Responsable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {!selectedMaestro ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-stone-400 text-sm">
                  Selecciona un ingrediente para ver sus movimientos
                </td>
              </tr>
            ) : fetchingMovimientos ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                </tr>
              ))
            ) : movimientos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-stone-400 text-sm">
                  No hay movimientos registrados
                </td>
              </tr>
            ) : (
              movimientos.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-stone-400">{m.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-stone-600 text-sm">{new Date(m.createdAt).toLocaleDateString('es-CO')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      m.type === 'ENTRADA'
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                        : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                    }`}>
                      {m.type === 'ENTRADA' ? 'Entrada' : 'Salida'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-stone-900">
                    {m.quantity} {maestroSeleccionado?.unit}
                  </td>
                  <td className="px-6 py-4 text-stone-600">{m.user?.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Gráfica */}
      {selectedMaestro && chartData.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Evolución</p>
            <h2 className="text-lg font-semibold text-stone-900">
              Movimientos del mes — {maestroSeleccionado?.name}
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value, name) => [
                  `${value} ${maestroSeleccionado?.unit}`,
                  name === 'entradas' ? 'Entradas' : 'Salidas'
                ]}
              />
              <Legend
                formatter={(value) => value === 'entradas' ? 'Entradas' : 'Salidas'}
                wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
              />
              <Bar dataKey="entradas" fill="#15803d" radius={[4, 4, 0, 0]} name="entradas" />
              <Bar dataKey="salidas" fill="#dc2626" radius={[4, 4, 0, 0]} name="salidas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Diálogo */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-stone-900">
              Agregar movimiento — {maestroSeleccionado?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-stone-700 text-sm font-medium">Tipo de movimiento</Label>
              <Select onValueChange={setType} defaultValue="ENTRADA">
                <SelectTrigger className="h-10 border-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada — llegó mercancía</SelectItem>
                  <SelectItem value="SALIDA">Salida — se usó en cocina</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-stone-700 text-sm font-medium">Cantidad</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="h-10 border-stone-200 flex-1"
                />
                <div className="h-10 px-4 flex items-center border border-stone-200 bg-stone-50 text-stone-600 text-sm rounded-md font-medium min-w-16 justify-center">
                  {maestroSeleccionado?.unit || 'und'}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="border-stone-200 text-stone-600 h-10">
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={loading} className="bg-stone-900 hover:bg-stone-700 text-white h-10">
                {loading ? 'Creando...' : 'Crear movimiento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}