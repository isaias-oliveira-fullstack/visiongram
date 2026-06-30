import prisma from '../../database/prisma'
import { AppError } from '../../shared/errors'
import bcrypt from 'bcrypt'

export class UserService {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        gender: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    })
  }

  async findOne(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
        followers: {
          select: {
            follower: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        following: {
          select: {
            following: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return {
      ...user,
      followers: user.followers.map((relation: any) => relation.follower),
      following: user.following.map((relation: any) => relation.following),
      followerCount: user.followers.length,
      followingCount: user.following.length
    }
  }

  async update(id: string, data: Partial<{ name: string; firstName: string; lastName: string; username: string; email: string; avatar: string; bio: string; gender: string }>) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Verifica a unicidade de username e email ao atualizar o perfil
    if (data.username && data.username !== user.username) {
      const existing = await prisma.user.findFirst({ where: { username: data.username } })
      if (existing) throw new AppError('Username already taken', 400)
    }

    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findFirst({ where: { email: data.email } })
      if (existing) throw new AppError('Email already taken', 400)
    }

    return prisma.user.update({
      where: { id },
      data: {
        name: data.name ?? user.name,
        firstName: data.firstName ?? user.firstName,
        lastName: data.lastName ?? user.lastName,
        username: data.username ?? user.username,
        email: data.email ?? user.email,
        avatar: data.avatar ?? user.avatar,
        bio: data.bio ?? user.bio,
        gender: data.gender ?? user.gender
      }
    })
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new AppError('User not found', 404)

    const matches = await bcrypt.compare(currentPassword, user.password)
    if (!matches) throw new AppError('Current password is incorrect', 401)

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id }, data: { password: hashed } })
    return { message: 'Password updated' }
  }

  async deleteMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new AppError('User not found', 404)
    }

    await prisma.$transaction([
      prisma.savedPost.deleteMany({
        where: {
          OR: [
            { userId },
            { post: { userId } }
          ]
        }
      }),
      prisma.like.deleteMany({
        where: {
          OR: [
            { userId },
            { post: { userId } }
          ]
        }
      }),
      prisma.comment.deleteMany({
        where: {
          OR: [
            { userId },
            { post: { userId } }
          ]
        }
      }),
      prisma.notification.deleteMany({
        where: {
          OR: [
            { actorId: userId },
            { recipientId: userId },
            { post: { userId } }
          ]
        }
      }),
      prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: userId },
            { followingId: userId }
          ]
        }
      }),
      prisma.passwordResetToken.deleteMany({ where: { userId } }),
      prisma.post.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ])

    return user
  }
}
