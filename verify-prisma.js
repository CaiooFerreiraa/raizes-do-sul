const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Order fields:', Object.keys(prisma.order.fields || {}));
  // If prisma.order.fields is not available (it's internal-ish), try to inspect count args
  try {
    await prisma.order.count({ where: { scheduledDate: new Date() } });
    console.log('scheduledDate is recognized');
  } catch (e) {
    console.log('Error inspecting scheduledDate:', e.message);
  }
  process.exit(0);
}

main();
