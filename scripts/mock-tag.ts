import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Mocking Face Recognition matches since API key is invalid...');

  const usersWithSelfies = await prisma.user.findMany({
    where: { referenceImageUrl: { not: null } }
  });

  if (usersWithSelfies.length === 0) {
    console.log('No users with reference selfies found.');
    return;
  }

  const mediaItems = await prisma.media.findMany({
    take: 3,
    orderBy: { uploadDate: 'desc' }
  });

  for (const user of usersWithSelfies) {
    for (const media of mediaItems) {
      const existingTag = await prisma.userTag.findFirst({
        where: { mediaId: media.id, taggedUserId: user.id }
      });

      if (!existingTag) {
        console.log(`Mock Tagging user ${user.name || user.email} in photo ${media.id}`);
        await prisma.userTag.create({
          data: {
            mediaId: media.id,
            taggedUserId: user.id,
            taggedById: media.uploaderId,
            isAiGenerated: true
          }
        });
      } else {
        console.log(`User ${user.name || user.email} is already tagged in photo ${media.id}`);
      }
    }
  }

  console.log('Mock tagging complete! Refresh the Tagged page.');
}

main().catch(console.error);
