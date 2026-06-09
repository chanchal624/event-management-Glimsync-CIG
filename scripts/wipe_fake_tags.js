const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const result = await prisma.userTag.deleteMany();
  console.log(`Deleted ${result.count} fake tags!`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
