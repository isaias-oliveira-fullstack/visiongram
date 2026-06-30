import { Router } from 'express'
import { UserController } from './user.controller'
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware'

const userRouter = Router()
const userController = new UserController()

// Endpoints públicos - visíveis sem autenticação
userRouter.get('/', userController.findAll.bind(userController))
userRouter.get('/:id', userController.findOne.bind(userController))

// Endpoints protegidos - requerem autenticação
userRouter.put('/:id', ensureAuthenticated, userController.update.bind(userController))
userRouter.put('/:id/password', ensureAuthenticated, userController.changePassword.bind(userController))
userRouter.delete('/me', ensureAuthenticated, userController.deleteMe.bind(userController))

export default userRouter
