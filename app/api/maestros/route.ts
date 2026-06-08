import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Obtener todos los maestros
export async function GET(): Promise<NextResponse> {
  try {
    const maestros = await prisma.maestro.findMany({
      where: { deleted: false },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ maestros }, { status: 200 });
  } catch (error) {
    console.error('Error fetching maestros:', error);
    return NextResponse.json({ error: 'Error al obtener maestros' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { name, balance, userId, unit } = await request.json();
    
    const maestro = await prisma.maestro.create({
      data: { name, balance, userId, unit },
      include: { user: true },
    });

    // Registrar el stock inicial como movimiento de ENTRADA
    if (balance > 0) {
      await prisma.movement.create({
        data: {
          type: 'ENTRADA',
          quantity: balance,
          maestroId: maestro.id,
          userId,
        },
      });
    }

    return NextResponse.json({ maestro }, { status: 201 });
  } catch (error) {
    console.error('Error creating maestro:', error);
    return NextResponse.json({ error: 'Error al crear maestro' }, { status: 500 });
  }
}