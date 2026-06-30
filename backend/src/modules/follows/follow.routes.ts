import { Router } from 'express'
import { FollowController } from './follow.controller'
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware'

const followRouter = Router()
const followController = new FollowController()

followRouter.post('/:id/follow', ensureAuthenticated, followController.follow.bind(followController))
followRouter.delete('/:id/follow', ensureAuthenticated, followController.unfollow.bind(followController))
followRouter.get('/:id/followers', ensureAuthenticated, followController.followers.bind(followController))
followRouter.get('/:id/following', ensureAuthenticated, followController.following.bind(followController))

export default followRouter
