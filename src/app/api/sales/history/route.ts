import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function checkSalesAuth() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  const decoded = await verifyJWT(token);
  if (!decoded || decoded.role !== 'SALES_OFFICER') return null;
  return decoded;
}

export async function GET() {
  const salesOfficer = await checkSalesAuth();
  if (!salesOfficer) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const logs = await prisma.salesLog.findMany({
      where: {
        userId: salesOfficer.id,
      },
      orderBy: {
        month: 'desc', // Show newest months first
      },
      include: {
        salesItems: {
          include: {
            carModel: true,
          },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Fetch sales history error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales history.' }, { status: 500 });
  }
}
