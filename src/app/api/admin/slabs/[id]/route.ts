import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateSlabRange } from '@/lib/slabs';

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
    const body = await request.json();
    const minRange = parseInt(body.minRange, 10);
    const maxRange = body.maxRange === null || body.maxRange === undefined || body.maxRange === '' 
      ? null 
      : parseInt(body.maxRange, 10);
    const incentivePerCar = parseFloat(body.incentivePerCar);

    if (isNaN(minRange) || isNaN(incentivePerCar)) {
      return NextResponse.json(
        { error: 'Minimum range and incentive per car must be numbers.' },
        { status: 400 }
      );
    }

    if (incentivePerCar < 0) {
      return NextResponse.json(
        { error: 'Incentive per car must be a positive number.' },
        { status: 400 }
      );
    }

    // 1. Fetch existing slabs
    const existingSlabs = await prisma.incentiveSlab.findMany();

    // 2. Perform validations, ignoring this slab's current ID
    const validationError = validateSlabRange(minRange, maxRange, existingSlabs, id);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // 3. Update slab in database
    const updatedSlab = await prisma.incentiveSlab.update({
      where: { id },
      data: {
        minRange,
        maxRange,
        incentivePerCar,
      },
    });

    return NextResponse.json({ slab: updatedSlab });
  } catch (error) {
    console.error('Update slab error:', error);
    return NextResponse.json({ error: 'Failed to update slab.' }, { status: 500 });
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
    await prisma.incentiveSlab.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Slab deleted successfully.' });
  } catch (error) {
    console.error('Delete slab error:', error);
    return NextResponse.json({ error: 'Failed to delete slab.' }, { status: 500 });
  }
}
