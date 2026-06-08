import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const maestroId = searchParams.get('maestroId');

  if (!maestroId) {
    return NextResponse.json({ error: 'maestroId es requerido' }, { status: 400 });
  }

  try {
    const movimientos = await prisma.movement.findMany({
      where: { maestroId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ movimientos }, { status: 200 });
  } catch (error) {
    console.error('Error fetching movimientos:', error);
    return NextResponse.json({ error: 'Error al obtener movimientos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { type, quantity, maestroId, userId } = await request.json();

    if (type === 'SALIDA') {
      const maestro = await prisma.maestro.findUnique({
        where: { id: maestroId },
      });
      if (!maestro) {
        return NextResponse.json({ error: 'Ingrediente no encontrado' }, { status: 404 });
      }
      if (maestro.balance < quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente. Disponible: ${maestro.balance} ${maestro.unit || 'und'}` },
          { status: 400 }
        );
      }
    }

    const movimiento = await prisma.movement.create({
      data: { type, quantity, maestroId, userId },
      include: { user: true },
    });

    const delta = type === 'ENTRADA' ? quantity : -quantity;
    await prisma.maestro.update({
      where: { id: maestroId },
      data: { balance: { increment: delta } },
    });

    return NextResponse.json({ movimiento }, { status: 201 });
  } catch (error) {
    console.error('Error creating movimiento:', error);
    return NextResponse.json({ error: 'Error al crear movimiento' }, { status: 500 });
  }
}