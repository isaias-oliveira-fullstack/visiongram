import { Router } from 'express'
import { AuthController } from './auth.controller'
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware'

const authRouter = Router()
const authController = new AuthController()

authRouter.post('/register', authController.register.bind(authController))
authRouter.post('/login', authController.login.bind(authController))
authRouter.post('/forgot-password', authController.forgotPassword.bind(authController))
authRouter.post('/reset-password', authController.resetPassword.bind(authController))
authRouter.get('/me', ensureAuthenticated, authController.me.bind(authController))

export default authRouter
