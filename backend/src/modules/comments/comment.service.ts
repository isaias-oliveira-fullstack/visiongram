import prisma from '../../database/prisma'
import { AppError } from '../../shared/errors'
import { NotificationService } from '../notifications/notification.service'

interface CreateCommentInput {
  postId: string
  userId: string
  content: string
  parentCommentId?: string
}

export class CommentService {
  private notificationService = new NotificationService()
  
  async create(data: CreateCommentInput) {
    const post = await prisma.post.findUnique({
      where: { id: data.postId },
      select: {
        id: true,
        disableComments: true,
        userId: true
      }
    })
    if (!post) {
      throw new AppError('Post not found', 404)
    }

    if (post.disableComments) {
      throw new AppError('Comments are disabled for this post', 403)
    }

    // Se for uma resposta a outro comentário, verifica se o comentário pai existe
    if (data.parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: data.parentCommentId }
      })
      if (!parentComment || parentComment.postId !== data.postId) {
        throw new AppError('Parent comment not found', 404)
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        userId: data.userId,
        parentCommentId: data.parentCommentId
      },
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
    })

    try {
      if (post.userId && post.userId !== data.userId) {
        await this.notificationService.create({
          type: 'comment',
          actorId: data.userId,
          recipientId: post.userId,
          postId: data.postId,
          data: { content: data.content }
        })
      }
    } catch (e) {
      // ignora falhas na criação de notificações
    }

    return comment
  }

  private buildCommentTree(comments: Array<any>) {
    const commentMap = new Map<string, any>()
    const roots: Array<any> = []

    for (const comment of comments) {
      comment.replies = []
      commentMap.set(comment.id, comment)
    }

    for (const comment of comments) {
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId)
        if (parent) {
          parent.replies.push(comment)
          continue
        }
      }
      roots.push(comment)
    }

    return roots
  }

  async findAll(postId: string) {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
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
    })

    return this.buildCommentTree(comments)
  }

  async findReplies(commentId: string) {
    return prisma.comment.findMany({
      where: { parentCommentId: commentId },
      orderBy: { createdAt: 'asc' },
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
    })
  }

  async delete(postId: string, commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment || comment.postId !== postId) {
      throw new AppError('Comment not found', 404)
    }

    if (comment.userId !== userId) {
      throw new AppError('Not authorized to delete this comment', 403)
    }

    await prisma.comment.delete({
      where: { id: commentId }
    })
  }
}
