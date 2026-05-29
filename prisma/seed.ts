import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding database...');

  // Clean database
  console.log('Cleaning existing records...');
  try {
    await prisma.salesItem.deleteMany({});
    await prisma.salesLog.deleteMany({});
    await prisma.carModel.deleteMany({});
    await prisma.incentiveSlab.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (error) {
    console.log('Note: clean-up skipped or database empty.');
  }

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const salesPasswordHash = await bcrypt.hash('sales123', 10);

  // Seed Users
  const admin1 = await prisma.user.create({
    data: {
      name: 'Manager Admin',
      email: 'admin@dealership.com',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      name: 'Toyota GM',
      email: 'manager@dealership.com',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const sales1 = await prisma.user.create({
    data: {
      name: 'John Sales',
      email: 'sales@dealership.com',
      password: salesPasswordHash,
      role: 'SALES_OFFICER',
    },
  });

  const sales2 = await prisma.user.create({
    data: {
      name: 'Alice Dealer',
      email: 'alice@dealership.com',
      password: salesPasswordHash,
      role: 'SALES_OFFICER',
    },
  });

  const sales3 = await prisma.user.create({
    data: {
      name: 'Bob Seller',
      email: 'bob@dealership.com',
      password: salesPasswordHash,
      role: 'SALES_OFFICER',
    },
  });

  const sales4 = await prisma.user.create({
    data: {
      name: 'Charlie Toyota',
      email: 'charlie@dealership.com',
      password: salesPasswordHash,
      role: 'SALES_OFFICER',
    },
  });

  console.log('Seeded 6 demo users.');

  // Seed Car Models
  const camry = await prisma.carModel.create({
    data: { modelName: 'Camry', baseSuffix: 'SE', variant: 'Petrol' }
  });
  const corolla = await prisma.carModel.create({
    data: { modelName: 'Corolla', baseSuffix: 'LE', variant: 'Hybrid' }
  });
  const rav4 = await prisma.carModel.create({
    data: { modelName: 'RAV4', baseSuffix: 'XLE', variant: 'EV' }
  });
  const prius = await prisma.carModel.create({
    data: { modelName: 'Prius', baseSuffix: 'Limited', variant: 'Hybrid' }
  });
  const tundra = await prisma.carModel.create({
    data: { modelName: 'Tundra', baseSuffix: 'SR5', variant: 'Diesel' }
  });

  console.log('Seeded car models.');

  // Seed Incentive Slabs
  await prisma.incentiveSlab.create({
    data: { minRange: 1, maxRange: 3, incentivePerCar: 1000 }
  });
  await prisma.incentiveSlab.create({
    data: { minRange: 4, maxRange: 7, incentivePerCar: 2000 }
  });
  await prisma.incentiveSlab.create({
    data: { minRange: 8, maxRange: null, incentivePerCar: 3500 }
  });

  console.log('Seeded incentive slabs.');

  // Seed Sales Logs (for the month of May 2026)
  const currentMonth = '2026-05';

  // 1. John Sales: 10 units -> Payout ₹35,000
  const logJohn = await prisma.salesLog.create({
    data: {
      userId: sales1.id,
      month: currentMonth,
      totalSales: 10,
      totalIncentive: 35000,
    }
  });
  await prisma.salesItem.createMany({
    data: [
      { salesLogId: logJohn.id, carModelId: corolla.id, quantity: 2 },
      { salesLogId: logJohn.id, carModelId: camry.id, quantity: 1 },
      { salesLogId: logJohn.id, carModelId: rav4.id, quantity: 1 },
      { salesLogId: logJohn.id, carModelId: prius.id, quantity: 1 },
      { salesLogId: logJohn.id, carModelId: tundra.id, quantity: 5 },
    ]
  });

  // 2. Alice Dealer: 8 units -> Payout ₹28,000
  const logAlice = await prisma.salesLog.create({
    data: {
      userId: sales2.id,
      month: currentMonth,
      totalSales: 8,
      totalIncentive: 28000,
    }
  });
  await prisma.salesItem.createMany({
    data: [
      { salesLogId: logAlice.id, carModelId: corolla.id, quantity: 4 },
      { salesLogId: logAlice.id, carModelId: camry.id, quantity: 2 },
      { salesLogId: logAlice.id, carModelId: rav4.id, quantity: 2 },
    ]
  });

  // 3. Bob Seller: 5 units -> Payout ₹10,000
  const logBob = await prisma.salesLog.create({
    data: {
      userId: sales3.id,
      month: currentMonth,
      totalSales: 5,
      totalIncentive: 10000,
    }
  });
  await prisma.salesItem.createMany({
    data: [
      { salesLogId: logBob.id, carModelId: corolla.id, quantity: 2 },
      { salesLogId: logBob.id, carModelId: camry.id, quantity: 1 },
      { salesLogId: logBob.id, carModelId: prius.id, quantity: 2 },
    ]
  });

  // 4. Charlie Toyota: 2 units -> Payout ₹2,000
  const logCharlie = await prisma.salesLog.create({
    data: {
      userId: sales4.id,
      month: currentMonth,
      totalSales: 2,
      totalIncentive: 2000,
    }
  });
  await prisma.salesItem.createMany({
    data: [
      { salesLogId: logCharlie.id, carModelId: tundra.id, quantity: 2 },
    ]
  });

  console.log('Seeded historical sales logs and breakdowns.');
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
