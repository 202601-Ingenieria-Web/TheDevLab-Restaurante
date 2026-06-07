import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { role } = await request.json();
    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}