import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function checkAdminAuth() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  const decoded = await verifyJWT(token);
  if (!decoded || decoded.role !== 'ADMIN') return null;
  return decoded;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = params;

  try {
    const { modelName, baseSuffix, variant } = await request.json();

    if (!modelName || !baseSuffix || !variant) {
      return NextResponse.json(
        { error: 'Model Name, Base Suffix, and Variant are required.' },
        { status: 400 }
      );
    }

    const updatedModel = await prisma.carModel.update({
      where: { id },
      data: {
        modelName,
        baseSuffix,
        variant,
      },
    });

    return NextResponse.json({ model: updatedModel });
  } catch (error) {
    console.error('Update car model error:', error);
    return NextResponse.json({ error: 'Failed to update car model.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = params;

  try {
    await prisma.carModel.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Car model deleted successfully.' });
  } catch (error: any) {
    console.error('Delete car model error:', error);
    // Prisma ForeignKeyConstraintViolation code is P2003
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete this car model because it is referenced in past sales logs.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to delete car model.' }, { status: 500 });
  }
}
