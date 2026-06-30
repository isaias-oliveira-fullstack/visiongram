import prisma from '../../database/prisma';
import { PostService } from '../posts/post.service';

export class SavedPostService {
  async save(userId: string, postId: string) {
    try {
      const savedPost = await prisma.savedPost.create({
        data: {
          userId,
          postId,
        },
        include: {
          post: {
            include: {
              user: true,
              likes: true,
              comments: true,
              savedBy: true,
            },
          },
        },
      });

      return { savedPost, created: true };
    } catch (err: any) {
      // Trata a restrição de unicidade quando o usuário já salvou este post
      if (err?.code === 'P2002') {
        const existing = await prisma.savedPost.findUnique({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
          include: {
            post: {
              include: {
                user: true,
                likes: true,
                comments: true,
                savedBy: true,
              },
            },
          },
        });

        if (existing) return { savedPost: existing, created: false };
      }

      throw err;
    }
  }

  async unsave(userId: string, postId: string) {
    const savedPost = await prisma.savedPost.deleteMany({
      where: {
        userId,
        postId,
      },
    });

    return savedPost;
  }

  async isSavedByUser(userId: string, postId: string) {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return !!savedPost;
  }

  async findUserSavedPosts(userId: string) {
    const savedPosts = await prisma.savedPost.findMany({
      where: {
        userId,
      },
      include: {
        post: {
          include: {
            user: true,
            likes: true,
            comments: {
              include: {
                user: true,
                replies: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            savedBy: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return savedPosts.map((sp: any) => sp.post);
  }
}
