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

interface Producto {
  id: string;
  name: string;
  price: number;
}

interface DetallePedido {
  productoId: string;
  nombre: string;
  quantity: number;
  unitPrice: number;
}

interface Pedido {
  id: string;
  status: string;
  orderType: string;
  total: number;
  createdAt: string;
  user: { name: string };
  detalles: { producto: { name: string }; quantity: number; subtotal: number; unitPrice: number }[];
  pago: { paymentMethod: string; amount: number } | null;
}

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20',
  EN_PREPARACION: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  LISTO: 'bg-green-50 text-green-700 ring-1 ring-green-600/20',
  ENTREGADO: 'bg-stone-50 text-stone-700 ring-1 ring-stone-600/20',
  CANCELADO: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
};

export default function PedidosPage() {
  const { data: session } = useSession();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState('EN_SITIO');
  const [detalles, setDetalles] = useState<DetallePedido[]>([]);
  const [selectedProducto, setSelectedProducto] = useState('');
  const [quantity, setQuantity] = useState('1');

  const [fetching, setFetching] = useState(true);
  const [pagoOpen, setPagoOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  const [pagoLoading, setPagoLoading] = useState(false);

  const [detalleOpen, setDetalleOpen] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);

  const isAdmin = session?.user?.role === 'ADMIN';

  const fetchPedidos = async () => {
    const res = await fetch('/api/pedidos');
    const data = await res.json();
    setPedidos(data.pedidos || []);
    setFetching(false);
  };

  const fetchProductos = async () => {
    const res = await fetch('/api/productos');
    const data = await res.json();
    setProductos(data.productos || []);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchPedidos();
      await fetchProductos();
    };
    loadData();
  }, []);

  const handleAddDetalle = () => {
    const producto = productos.find((p) => p.id === selectedProducto);
    if (!producto || !quantity) return;
    setDetalles([...detalles, {
      productoId: producto.id,
      nombre: producto.name,
      quantity: parseInt(quantity),
      unitPrice: producto.price,
    }]);
    setSelectedProducto('');
    setQuantity('1');
  };

  const handleCreatePedido = async () => {
    if (detalles.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType,
          detalles: detalles.map((d) => ({
            productoId: d.productoId,
            quantity: d.quantity,
            unitPrice: d.unitPrice,
          })),
          userId: session?.user?.id,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Pedido creado exitosamente');
      setOpen(false);
      setDetalles([]);
      fetchPedidos();
    } catch {
      toast.error('Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  const handlePago = async () => {
    if (!selectedPedido) return;
    setPagoLoading(true);
    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: selectedPedido.id,
          amount: selectedPedido.total,
          paymentMethod,
          userId: session?.user?.id,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Pago registrado exitosamente');
      setPagoOpen(false);
      fetchPedidos();
    } catch {
      toast.error('Error al registrar el pago');
    } finally {
      setPagoLoading(false);
    }
  };

  const handleUpdateStatus = async (pedidoId: string, status: string) => {
    try {
      await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success('Estado actualizado');
      fetchPedidos();
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const total = detalles.reduce((acc, d) => acc + d.quantity * d.unitPrice, 0);

  // KPIs
  const pendientes = pedidos.filter(p => p.status === 'PENDIENTE').length;
  const enPreparacion = pedidos.filter(p => p.status === 'EN_PREPARACION').length;
  const entregados = pedidos.filter(p => p.status === 'ENTREGADO').length;
  const sinPago = pedidos.filter(p => !p.pago).length;

  return (
    <div className="p-8 w-full space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Restaurante</p>
          <h1 className="text-3xl font-bold text-stone-900">Gestión de Pedidos</h1>
          <p className="text-stone-500 text-sm mt-1">Administra y controla los pedidos del restaurante.</p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="bg-stone-900 hover:bg-stone-700 text-white px-6 h-10 text-sm font-medium"
        >
          + Nuevo pedido
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {fetching ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{pendientes}</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">En preparación</p>
              <p className="text-3xl font-bold text-blue-600">{enPreparacion}</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Entregados</p>
              <p className="text-3xl font-bold text-green-600">{entregados}</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Sin pago</p>
              <p className="text-3xl font-bold text-red-600">{sinPago}</p>
            </div>
          </>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Mesero</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Total</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Pago</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Detalle</th>
              {isAdmin && <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Actualizar</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {fetching ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-24 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                </tr>
              ))
            ) : pedidos.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-stone-400 text-sm">
                  No hay pedidos registrados
                </td>
              </tr>
            ) : (
              pedidos.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-stone-400">{p.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-stone-700 font-medium">{p.user?.name}</td>
                  <td className="px-6 py-4 text-stone-600 text-sm">{p.orderType === 'EN_SITIO' ? 'En sitio' : 'Para llevar'}</td>
                  <td className="px-6 py-4 font-semibold text-stone-900">${p.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.pago ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-green-600/20">
                        {p.pago.paymentMethod}
                      </span>
                    ) : (
                      <button
                        onClick={() => { setSelectedPedido(p); setPagoOpen(true); }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium underline-offset-2 hover:underline"
                      >
                        Registrar pago
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => { setPedidoDetalle(p); setDetalleOpen(true); }}
                      className="text-xs text-stone-600 hover:text-stone-900 font-medium underline-offset-2 hover:underline"
                    >
                      Ver detalle
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <Select onValueChange={(val) => handleUpdateStatus(p.id, val)} defaultValue={p.status}>
                        <SelectTrigger className="h-8 text-xs border-stone-200 w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                          <SelectItem value="EN_PREPARACION">En preparación</SelectItem>
                          <SelectItem value="LISTO">Listo</SelectItem>
                          <SelectItem value="ENTREGADO">Entregado</SelectItem>
                          <SelectItem value="CANCELADO">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal detalle */}
      <Dialog open={detalleOpen} onOpenChange={setDetalleOpen}>
        <DialogContent className="rounded-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-stone-900">Detalle del pedido</DialogTitle>
            <p className="text-stone-500 text-sm">
              {pedidoDetalle?.orderType === 'EN_SITIO' ? 'Para comer en sitio' : 'Para llevar'} —{' '}
              {pedidoDetalle && new Date(pedidoDetalle.createdAt).toLocaleDateString('es-CO')}
            </p>
          </DialogHeader>
          <div className="mt-2">
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Cant.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {pedidoDetalle?.detalles.map((d, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-stone-800 font-medium">{d.producto.name}</td>
                      <td className="px-4 py-3 text-stone-600">{d.quantity}</td>
                      <td className="px-4 py-3 text-stone-600">${d.unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-stone-900">${d.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-stone-50 border-t border-stone-200">
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold text-stone-700">Total:</td>
                    <td className="px-4 py-3 font-bold text-stone-900">${pedidoDetalle?.total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-stone-50 rounded-lg p-3">
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Estado</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[pedidoDetalle?.status || 'PENDIENTE']}`}>
                  {STATUS_LABELS[pedidoDetalle?.status || 'PENDIENTE']}
                </span>
              </div>
              <div className="bg-stone-50 rounded-lg p-3">
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Pago</p>
                <p className="text-sm font-medium text-stone-700">
                  {pedidoDetalle?.pago ? pedidoDetalle.pago.paymentMethod : 'Pendiente'}
                </p>
              </div>
              <div className="bg-stone-50 rounded-lg p-3">
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Mesero</p>
                <p className="text-sm font-medium text-stone-700">{pedidoDetalle?.user?.name}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal nuevo pedido */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-stone-900">Nuevo pedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-stone-700 text-sm font-medium">Tipo de orden</Label>
              <Select onValueChange={setOrderType} defaultValue="EN_SITIO">
                <SelectTrigger className="h-10 border-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN_SITIO">Para comer en sitio</SelectItem>
                  <SelectItem value="PARA_LLEVAR">Para llevar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-stone-700 text-sm font-medium">Agregar producto</Label>
              <div className="flex gap-2">
                <Select onValueChange={setSelectedProducto} value={selectedProducto}>
                  <SelectTrigger className="h-10 border-stone-200 flex-1">
                    <SelectValue placeholder="Selecciona un producto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — ${p.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-20 h-10 border-stone-200"
                  min="1"
                />
                <Button onClick={handleAddDetalle} className="h-10 bg-stone-900 hover:bg-stone-700 text-white px-4">
                  +
                </Button>
              </div>
            </div>
            {detalles.length > 0 && (
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-stone-500">Producto</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-stone-500">Cant.</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-stone-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {detalles.map((d, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-stone-700">{d.nombre}</td>
                        <td className="px-4 py-2 text-stone-600">{d.quantity}</td>
                        <td className="px-4 py-2 font-medium text-stone-900">${(d.quantity * d.unitPrice).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-stone-50 border-t border-stone-200">
                      <td colSpan={2} className="px-4 py-2 text-right font-semibold text-stone-700">Total:</td>
                      <td className="px-4 py-2 font-bold text-stone-900">${total.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="border-stone-200 text-stone-600 h-10">
                Cancelar
              </Button>
              <Button onClick={handleCreatePedido} disabled={loading || detalles.length === 0} className="bg-stone-900 hover:bg-stone-700 text-white h-10">
                {loading ? 'Creando...' : 'Crear pedido'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pago */}
      <Dialog open={pagoOpen} onOpenChange={setPagoOpen}>
        <DialogContent className="rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-stone-900">Registrar pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Total a pagar</p>
              <p className="text-2xl font-bold text-stone-900">${selectedPedido?.total.toLocaleString()}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-stone-700 text-sm font-medium">Método de pago</Label>
              <Select onValueChange={setPaymentMethod} defaultValue="EFECTIVO">
                <SelectTrigger className="h-10 border-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                  <SelectItem value="TARJETA">Tarjeta</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPagoOpen(false)} className="border-stone-200 text-stone-600 h-10">
                Cancelar
              </Button>
              <Button onClick={handlePago} disabled={pagoLoading} className="bg-stone-900 hover:bg-stone-700 text-white h-10">
                {pagoLoading ? 'Registrando...' : 'Confirmar pago'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}