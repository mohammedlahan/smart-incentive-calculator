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
  const admin = await prisma.user.create({
    data: {
      name: 'Manager Admin',
      email: 'admin@dealership.com',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const salesOfficer = await prisma.user.create({
    data: {
      name: 'John Sales',
      email: 'sales@dealership.com',
      password: salesPasswordHash,
      role: 'SALES_OFFICER',
    },
  });

  console.log('Seeded core users:', { 
    admin: admin.email, 
    salesOfficer: salesOfficer.email 
  });

  // Seed Car Models
  await prisma.carModel.create({
    data: { modelName: 'Camry', baseSuffix: 'SE', variant: 'Petrol' }
  });
  await prisma.carModel.create({
    data: { modelName: 'Corolla', baseSuffix: 'LE', variant: 'Hybrid' }
  });
  await prisma.carModel.create({
    data: { modelName: 'RAV4', baseSuffix: 'XLE', variant: 'EV' }
  });
  await prisma.carModel.create({
    data: { modelName: 'Prius', baseSuffix: 'Limited', variant: 'Hybrid' }
  });
  await prisma.carModel.create({
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
