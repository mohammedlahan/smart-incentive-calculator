import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    const models = await prisma.carModel.findMany({
      orderBy: { modelName: 'asc' },
    });
    return NextResponse.json({ models });
  } catch (error) {
    console.error('Fetch car models error:', error);
    return NextResponse.json({ error: 'Failed to fetch car models.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { modelName, baseSuffix, variant } = await request.json();

    if (!modelName || !baseSuffix || !variant) {
      return NextResponse.json(
        { error: 'Model Name, Base Suffix, and Variant are required.' },
        { status: 400 }
      );
    }

    const newModel = await prisma.carModel.create({
      data: {
        modelName,
        baseSuffix,
        variant,
      },
    });

    return NextResponse.json({ model: newModel }, { status: 201 });
  } catch (error) {
    console.error('Create car model error:', error);
    return NextResponse.json({ error: 'Failed to create car model.' }, { status: 500 });
  }
}
