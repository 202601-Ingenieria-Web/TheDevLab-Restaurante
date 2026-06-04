import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Obtener movimientos por maestro
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
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ movimientos }, { status: 200 });
  } catch (error) {
    console.error('Error fetching movimientos:', error);
    return NextResponse.json({ error: 'Error al obtener movimientos' }, { status: 500 });
  }
}

// POST - Crear un movimiento
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { type, quantity, maestroId, userId } = await request.json();

    const movimiento = await prisma.movement.create({
      data: { type, quantity, maestroId, userId },
      include: { user: true },
    });

    // Actualizar el saldo del maestro
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