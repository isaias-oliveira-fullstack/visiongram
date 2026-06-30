import { Request, Response } from 'express'
import { LikeService } from './like.service'

export class LikeController {
  private likeService = new LikeService()

  async create(req: Request, res: Response) {
    const postId = req.params.id
    const userId = req.user.id
    const post = await this.likeService.create(postId, userId)
    return res.status(201).json(post)
  }

  async remove(req: Request, res: Response) {
    const postId = req.params.id
    const userId = req.user.id
    const post = await this.likeService.remove(postId, userId)
    return res.status(200).json(post)
  }
}
