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

export async function GET() {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const slabs = await prisma.incentiveSlab.findMany({
      orderBy: { minRange: 'asc' },
    });
    return NextResponse.json({ slabs });
  } catch (error) {
    console.error('Fetch slabs error:', error);
    return NextResponse.json({ error: 'Failed to fetch slabs.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

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

    // 1. Fetch existing slabs to run overlap checks
    const existingSlabs = await prisma.incentiveSlab.findMany();

    // 2. Perform validations
    const validationError = validateSlabRange(minRange, maxRange, existingSlabs);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // 3. Save slab to database
    const newSlab = await prisma.incentiveSlab.create({
      data: {
        minRange,
        maxRange,
        incentivePerCar,
      },
    });

    return NextResponse.json({ slab: newSlab }, { status: 201 });
  } catch (error) {
    console.error('Create slab error:', error);
    return NextResponse.json({ error: 'Failed to create slab.' }, { status: 500 });
  }
}
