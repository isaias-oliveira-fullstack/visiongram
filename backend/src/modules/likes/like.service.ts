import prisma from '../../database/prisma'
import { AppError } from '../../shared/errors'
import { NotificationService } from '../notifications/notification.service'

// Configuração de inclusão do Prisma para posts com todas as relações
const postInclude = {
  user: {
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true
    }
  },
  likes: true,
  comments: {
    where: {
      parentCommentId: null // Apenas comentários de nível superior
    },
    orderBy: { createdAt: 'asc' as const },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true
        }
      },
      replies: {
        orderBy: { createdAt: 'asc' as const },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true
            }
          }
        }
      }
    }
  }
}

export class LikeService {
  private notificationService = new NotificationService()

  async create(postId: string, userId: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      throw new AppError('Post not found', 404)
    }

    await prisma.like.create({
      data: {
        postId,
        userId
      }
    })

    // cria uma notificação para o dono do post quando quem curtiu não for o próprio dono
    try {
      if (post.userId && post.userId !== userId) {
        await this.notificationService.create({
          type: 'like',
          actorId: userId,
          recipientId: post.userId,
          postId: postId,
          data: null
        })
      }
    } catch (e) {
      // ignora falhas na criação de notificações
    }

    // Retorna o post atualizado com todas as relações
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: postInclude
    })

    return updatedPost
  }

  async remove(postId: string, userId: string) {
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    })

    if (!like) {
      throw new AppError('Like not found', 404)
    }

    await prisma.like.delete({ where: { id: like.id } })

    // Retorna o post atualizado com todas as relações
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: postInclude
    })

    return updatedPost
  }
}
