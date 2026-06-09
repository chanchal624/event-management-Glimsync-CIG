import { prisma } from '../src/lib/prisma';
import { matchFacesInImage } from '../src/lib/ai/vision';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('Starting scan of existing photos...');
  const usersWithSelfies = await prisma.user.findMany({
    where: { referenceImageUrl: { not: null } },
    select: { id: true, referenceImageUrl: true }
  });

  if (usersWithSelfies.length === 0) {
    console.log('No users with selfies found. Exiting.');
    return;
  }

  console.log(`Found ${usersWithSelfies.length} user(s) with reference selfies.`);

  const mediaItems = await prisma.media.findMany({
    include: { event: true }
  });

  console.log(`Scanning ${mediaItems.length} photos...`);

  for (const media of mediaItems) {
    try {
      const filePath = path.join(process.cwd(), 'public', media.s3Url);
      const buffer = await fs.readFile(filePath);
      const ext = path.extname(media.s3Url).substring(1).toLowerCase();
      const mimeType = 'image/' + (ext === 'jpg' ? 'jpeg' : ext);

      const matchedIds = await matchFacesInImage(buffer, mimeType, usersWithSelfies as any);

      if (matchedIds.length > 0) {
        console.log(`Image ${media.id}: Found matches: ${matchedIds.join(', ')}`);

        for (const matchedId of matchedIds) {
          const existingTag = await prisma.userTag.findFirst({
            where: { mediaId: media.id, taggedUserId: matchedId }
          });

          if (!existingTag) {
            console.log(`-> Creating UserTag for user ${matchedId} in media ${media.id}`);
            await prisma.userTag.create({
              data: {
                mediaId: media.id,
                taggedUserId: matchedId,
                taggedById: media.uploaderId
              }
            });
          } else {
             console.log(`-> Tag already exists for user ${matchedId} in media ${media.id}`);
          }
        }
      }
    } catch(e: any) {
      console.error(`Failed on media ${media.id}:`, e.message);
    }
  }
  console.log('Done scanning existing photos.');
}

main().catch(console.error);
