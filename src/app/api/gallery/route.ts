import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const mediaList = await prisma.media.findMany({
      where: {
        isPrivate: false,
        event: {
          isPrivate: false,
        },
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            category: true,
          },
        },
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
            referenceImageUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },

        comments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        userTags: {
          include: {
            taggedUser: {
              select: {
                id: true,
                name: true,
                email: true,
                referenceImageUrl: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: true
          }
        },
        ...(userId && {
          likes: {
            where: {
              userId: userId,
            },
            select: {
              userId: true,
            },
          },
          favorites: {
            where: {
              userId: userId,
            },
            select: {
              userId: true,
            },
          },
        }),
      },
      orderBy: [
        { likes: { _count: 'desc' } },
        { uploadDate: 'desc' },
      ],
      take: 50,
    });

    const formattedMedia = mediaList.map((media) => {
      const isLikedByMe = userId ? media.likes?.length > 0 : false;
      const isFavoritedByMe = userId ? media.favorites?.length > 0 : false;

      return {
        id: media.id,
        s3Url: media.s3Url,
        uploadDate: media.uploadDate,
        event: media.event,
        uploader: media.uploader,
        likesCount: media._count.likes,
        commentsCount: media._count.comments,
        sharesCount: media.sharesCount,
        comments: media.comments,
        tags: media.tags.map((t: any) => t.tag),
        userTags: media.userTags.map((ut: any) => ut.taggedUser),
        metadata: media.metadata,
        isLikedByMe,
        isFavoritedByMe,
      };
    });

    return NextResponse.json(formattedMedia);
  } catch (error) {
    console.error("Error fetching public gallery:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
