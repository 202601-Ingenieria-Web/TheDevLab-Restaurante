import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const pedido = await prisma.pedido.update({
      where: { id },
      data: { status },
      include: {
        detalles: { include: { producto: true } },
        pago: true,
        user: true,
      },
    });
    return NextResponse.json({ pedido }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 });
  }
}