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
    // 1. Summary Metrics
    const logsSummary = await prisma.salesLog.aggregate({
      _sum: {
        totalSales: true,
        totalIncentive: true,
      },
    });

    const officersCount = await prisma.user.count({
      where: { role: 'SALES_OFFICER' },
    });

    const modelsCount = await prisma.carModel.count();

    const summary = {
      totalSales: logsSummary._sum.totalSales || 0,
      totalIncentives: logsSummary._sum.totalIncentive || 0,
      activeOfficersCount: officersCount,
      totalCarModelsCount: modelsCount,
    };

    // 2. Monthly Trends
    const logs = await prisma.salesLog.findMany({
      select: {
        month: true,
        totalSales: true,
        totalIncentive: true,
      },
    });

    // Group logs by month
    const monthlyMap: Record<string, { month: string; sales: number; incentive: number }> = {};
    logs.forEach((log) => {
      if (!monthlyMap[log.month]) {
        monthlyMap[log.month] = { month: log.month, sales: 0, incentive: 0 };
      }
      monthlyMap[log.month].sales += log.totalSales;
      monthlyMap[log.month].incentive += log.totalIncentive;
    });

    const monthlyTrends = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    // 3. Top Performing Officers
    const userLogs = await prisma.salesLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const userMap: Record<string, { name: string; email: string; sales: number; incentive: number }> = {};
    userLogs.forEach((log) => {
      const uId = log.userId;
      if (!userMap[uId]) {
        userMap[uId] = {
          name: log.user.name,
          email: log.user.email,
          sales: 0,
          incentive: 0,
        };
      }
      userMap[uId].sales += log.totalSales;
      userMap[uId].incentive += log.totalIncentive;
    });

    const topPerformers = Object.values(userMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Top 5

    // 4. Car Models Sales Distribution
    const items = await prisma.salesItem.findMany({
      include: {
        carModel: {
          select: {
            modelName: true,
            baseSuffix: true,
          },
        },
      },
    });

    const modelMap: Record<string, { model: string; sales: number }> = {};
    items.forEach((item) => {
      const modelLabel = `${item.carModel.modelName} ${item.carModel.baseSuffix}`;
      if (!modelMap[modelLabel]) {
        modelMap[modelLabel] = { model: modelLabel, sales: 0 };
      }
      modelMap[modelLabel].sales += item.quantity;
    });

    const modelSales = Object.values(modelMap).sort((a, b) => b.sales - a.sales);

    return NextResponse.json({
      summary,
      monthlyTrends,
      topPerformers,
      modelSales,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to compile analytics.' }, { status: 500 });
  }
}
