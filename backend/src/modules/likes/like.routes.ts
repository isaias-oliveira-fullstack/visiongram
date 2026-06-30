import { Router } from 'express'
import { LikeController } from './like.controller'
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware'

const likeRouter = Router()
const likeController = new LikeController()

likeRouter.post('/:id/like', ensureAuthenticated, likeController.create.bind(likeController))
likeRouter.delete('/:id/like', ensureAuthenticated, likeController.remove.bind(likeController))

export default likeRouter
