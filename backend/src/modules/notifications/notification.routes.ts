import { Router } from 'express'
import { NotificationController } from './notification.controller'
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware'

const router = Router()
const controller = new NotificationController()

router.get('/', ensureAuthenticated, controller.listForUser.bind(controller))
router.post('/', ensureAuthenticated, controller.create.bind(controller))
router.post('/:id/read', ensureAuthenticated, controller.markRead.bind(controller))

export default router
