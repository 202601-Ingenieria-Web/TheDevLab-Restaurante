import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(): Promise<NextResponse> {
  try {
    const productos = await prisma.producto.findMany({
      where: { available: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ productos }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { name, description, price } = await request.json();
    const producto = await prisma.producto.create({
      data: { name, description, price },
    });
    return NextResponse.json({ producto }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}