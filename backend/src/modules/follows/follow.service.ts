import prisma from '../../database/prisma'
import { AppError } from '../../shared/errors'
import { NotificationService } from '../notifications/notification.service'

export class FollowService {
  private notificationService = new NotificationService()
  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new AppError('Cannot follow yourself', 400)
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    if (existing) {
      // Se já existir, retorna o registro existente para manter o comportamento idempotente
      return existing
    }

    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId
      }
    })

    try {
      if (followingId && followingId !== followerId) {
        await this.notificationService.create({
          type: 'follow',
          actorId: followerId,
          recipientId: followingId,
          data: null
        })
      }
    } catch (e) {
      // ignora falhas na criação de notificações
    }

    return follow
  }

  async unfollow(followerId: string, followingId: string) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    if (!follow) {
      throw new AppError('Follow relationship not found', 404)
    }

    await prisma.follow.delete({ where: { id: follow.id } })
  }

  async getFollowers(userId: string) {
    return prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
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

  async getFollowing(userId: string) {
    return prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
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
}
