import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateIncentive } from '@/lib/incentive';

async function checkSalesAuth() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  const decoded = await verifyJWT(token);
  if (!decoded || decoded.role !== 'SALES_OFFICER') return null;
  return decoded;
}

export async function GET(request: Request) {
  const salesOfficer = await checkSalesAuth();
  if (!salesOfficer) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');

  if (!month) {
    return NextResponse.json({ error: 'Month parameter is required.' }, { status: 400 });
  }

  try {
    // 1. Fetch active slabs
    const slabs = await prisma.incentiveSlab.findMany({
      orderBy: { minRange: 'asc' },
    });

    // 2. Fetch car models
    const carModels = await prisma.carModel.findMany({
      orderBy: { modelName: 'asc' },
    });

    // 3. Fetch sales log for this month (if it exists)
    const salesLog = await prisma.salesLog.findUnique({
      where: {
        userId_month: {
          userId: salesOfficer.id,
          month,
        },
      },
      include: {
        salesItems: {
          include: {
            carModel: true,
          },
        },
      },
    });

    return NextResponse.json({
      salesLog,
      slabs,
      carModels,
    });
  } catch (error) {
    console.error('Fetch logs API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve sales logs.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const salesOfficer = await checkSalesAuth();
  if (!salesOfficer) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { month, sales } = await request.json(); // sales: Array of { carModelId, quantity }

    if (!month || !sales || !Array.isArray(sales)) {
      return NextResponse.json({ error: 'Month and sales entries are required.' }, { status: 400 });
    }

    // 1. Validate quantity inputs and sum up total cars sold
    let totalSales = 0;
    const validatedSalesItems = sales
      .map((item: any) => {
        const quantity = parseInt(item.quantity, 10);
        const q = isNaN(quantity) || quantity < 0 ? 0 : quantity;
        totalSales += q;
        return {
          carModelId: item.carModelId,
          quantity: q,
        };
      })
      .filter((item) => item.quantity > 0); // Keep only entries > 0 to keep DB clean

    // 2. Fetch active slabs and calculate total incentive
    const slabs = await prisma.incentiveSlab.findMany();
    const formattedSlabs = slabs.map((s) => ({
      id: s.id,
      minRange: s.minRange,
      maxRange: s.maxRange,
      incentivePerCar: s.incentivePerCar,
    }));

    const calc = calculateIncentive(totalSales, formattedSlabs);

    // 3. Run database transaction to write log & items atomicly
    const result = await prisma.$transaction(async (tx) => {
      // Create or update the SalesLog
      const salesLog = await tx.salesLog.upsert({
        where: {
          userId_month: {
            userId: salesOfficer.id,
            month,
          },
        },
        create: {
          userId: salesOfficer.id,
          month,
          totalSales,
          totalIncentive: calc.totalIncentive,
        },
        update: {
          totalSales,
          totalIncentive: calc.totalIncentive,
        },
      });

      // Clear any old sales items for this month log
      await tx.salesItem.deleteMany({
        where: { salesLogId: salesLog.id },
      });

      // Insert new sales items
      if (validatedSalesItems.length > 0) {
        await tx.salesItem.createMany({
          data: validatedSalesItems.map((item) => ({
            salesLogId: salesLog.id,
            carModelId: item.carModelId,
            quantity: item.quantity,
          })),
        });
      }

      return salesLog;
    });

    return NextResponse.json({
      success: true,
      salesLog: result,
      totalSales,
      totalIncentive: calc.totalIncentive,
    });
  } catch (error) {
    console.error('Log sales API error:', error);
    return NextResponse.json({ error: 'Failed to log monthly sales.' }, { status: 500 });
  }
}
