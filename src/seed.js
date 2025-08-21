const { PrismaClient } = require('@prisma/client');
const { seedStocks } = require('./utils/stockData');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  await seedStocks(prisma);
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });