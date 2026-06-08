import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Enum_Role } from '@/app/generated/prisma/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { role, name, email, image } = await request.json();
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role: role as Enum_Role,
        image,
      },
    });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}