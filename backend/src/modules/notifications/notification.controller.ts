import { Request, Response } from 'express'
import { NotificationService } from './notification.service'

export class NotificationController {
  private service = new NotificationService()

  async listForUser(req: Request, res: Response) {
    const userId = req.user.id
    const notifications = await this.service.findByRecipient(userId)
    return res.json(notifications)
  }

  async create(req: Request, res: Response) {
    const { type, recipientId, postId, data } = req.body
    const actorId = req.user?.id
    const note = await this.service.create({ type, actorId, recipientId, postId, data })
    return res.status(201).json(note)
  }

  async markRead(req: Request, res: Response) {
    const userId = req.user.id
    const id = req.params.id
    const updated = await this.service.markAsRead(id, userId)
    if (!updated) return res.status(404).send()
    return res.json(updated)
  }
}
