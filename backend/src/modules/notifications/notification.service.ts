import prisma from '../../database/prisma'

interface CreateNotificationInput {
  type: string
  actorId?: string
  recipientId: string
  postId?: string
  data?: any
}

export class NotificationService {
  async create(input: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        type: input.type,
        actorId: input.actorId,
        recipientId: input.recipientId,
        postId: input.postId,
        data: input.data ?? null
      }
    })
  }

  async findByRecipient(recipientId: string) {
    return prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: { id: true, username: true, avatar: true }
        },
        post: {
          select: { id: true, imageUrl: true }
        }
      }
    })
  }

  async markAsRead(notificationId: string, recipientId: string) {
    const note = await prisma.notification.findUnique({ where: { id: notificationId } })
    if (!note || note.recipientId !== recipientId) return null
    return prisma.notification.update({ where: { id: notificationId }, data: { read: true } })
  }
}
