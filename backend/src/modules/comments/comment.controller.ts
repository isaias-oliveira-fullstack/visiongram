import { Request, Response } from 'express'
import { CommentService } from './comment.service'

export class CommentController {
  private commentService = new CommentService()

  async create(req: Request, res: Response) {
    const postId = req.params.id
    const userId = req.user.id
    const { content, parentCommentId } = req.body

    const comment = await this.commentService.create({ 
      postId, 
      userId, 
      content,
      parentCommentId
    })
    return res.status(201).json(comment)
  }

  async findAll(req: Request, res: Response) {
    const comments = await this.commentService.findAll(req.params.id)
    return res.json(comments)
  }

  async findReplies(req: Request, res: Response) {
    const replies = await this.commentService.findReplies(req.params.commentId)
    return res.json(replies)
  }

  async delete(req: Request, res: Response) {
    const postId = req.params.id
    const commentId = req.params.commentId
    const userId = req.user.id

    await this.commentService.delete(postId, commentId, userId)
    return res.status(204).send()
  }
}

