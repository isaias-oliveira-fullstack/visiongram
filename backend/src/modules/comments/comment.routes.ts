import { Router } from 'express'
import { CommentController } from './comment.controller'
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware'

const commentRouter = Router()
const commentController = new CommentController()

commentRouter.post('/:id/comments', ensureAuthenticated, commentController.create.bind(commentController))
commentRouter.get('/:id/comments', ensureAuthenticated, commentController.findAll.bind(commentController))
commentRouter.get('/:id/comments/:commentId/replies', ensureAuthenticated, commentController.findReplies.bind(commentController))
commentRouter.delete('/:id/comments/:commentId', ensureAuthenticated, commentController.delete.bind(commentController))

export default commentRouter
