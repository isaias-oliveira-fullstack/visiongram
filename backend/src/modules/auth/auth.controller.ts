import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { AppError } from '../../shared/errors'

export class AuthController {
  private authService = new AuthService()

  async register(req: Request, res: Response) {
    const { firstName, lastName, username, email, password, avatar, bio } = req.body

    const { user, token } = await this.authService.register({ firstName, lastName, username, email, password, avatar, bio })

    return res.status(201).json({ user, token })
  }

  async login(req: Request, res: Response) {
    const { emailOrUsername, password } = req.body

    const { user, token } = await this.authService.login({ emailOrUsername, password })

    return res.json({ user, token })
  }

  async forgotPassword(req: Request, res: Response) {
    const { emailOrUsername } = req.body
    if (!emailOrUsername) {
      throw new AppError('Email ou nome de usuário é obrigatório', 400)
    }

    await this.authService.forgotPassword(emailOrUsername)
    return res.json({ message: 'If the account exists, a password reset link has been sent.' })
  }

  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body
    if (!token || !password) {
      throw new AppError('Token e nova senha são obrigatórios', 400)
    }

    await this.authService.resetPassword(token, password)
    return res.json({ message: 'Senha redefinida com sucesso' })
  }

  async me(req: Request, res: Response) {
    const userId = (req as any).user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const user = await this.authService.me(userId)
    return res.json(user)
  }
}
