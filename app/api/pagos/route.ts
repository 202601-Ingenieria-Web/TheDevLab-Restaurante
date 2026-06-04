import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { pedidoId, amount, paymentMethod, userId } = await request.json();

    const pago = await prisma.pago.create({
      data: {
        pedidoId,
        amount,
        paymentMethod,
        userId,
      },
    });

    // Actualizar estado del pedido a EN_PREPARACION
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { status: 'EN_PREPARACION' },
    });

    return NextResponse.json({ pago }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar pago' }, { status: 500 });
  }
}