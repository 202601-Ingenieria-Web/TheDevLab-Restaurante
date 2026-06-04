import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(): Promise<NextResponse> {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        user: true,
        detalles: { include: { producto: true } },
        pago: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ pedidos }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { orderType, detalles, userId } = await request.json();

    const total = detalles.reduce(
      (acc: number, d: { quantity: number; unitPrice: number }) =>
        acc + d.quantity * d.unitPrice,
      0
    );

    const pedido = await prisma.pedido.create({
      data: {
        orderType,
        total,
        userId,
        detalles: {
          create: detalles.map((d: { productoId: string; quantity: number; unitPrice: number }) => ({
            productoId: d.productoId,
            quantity: d.quantity,
            unitPrice: d.unitPrice,
            subtotal: d.quantity * d.unitPrice,
          })),
        },
      },
      include: {
        detalles: { include: { producto: true } },
      },
    });

    return NextResponse.json({ pedido }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 });
  }
}