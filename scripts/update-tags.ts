import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.userTag.updateMany({
    data: { isAiGenerated: true }
  });
  console.log("Updated existing tags to be AI Generated");
}

main().catch(console.error);
