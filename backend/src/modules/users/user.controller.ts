import { Request, Response } from 'express'
import { UserService } from './user.service'

export class UserController {
  private userService = new UserService()

  async findAll(req: Request, res: Response) {
    const users = await this.userService.findAll()
    return res.json(users)
  }

  async findOne(req: Request, res: Response) {
    const user = await this.userService.findOne(req.params.id)
    return res.json(user)
  }

  async update(req: Request, res: Response) {
    try {
      const updatedUser = await this.userService.update(req.params.id, req.body)
      return res.json(updatedUser)
    } catch (error: any) {
      return res.status(error?.status || 500).json({ message: error?.message || 'Internal server error' })
    }
  }

  async changePassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.body
    const result = await this.userService.changePassword(req.params.id, currentPassword, newPassword)
    return res.json(result)
  }

  async deleteMe(req: Request, res: Response) {
    const deletedUser = await this.userService.deleteMe(req.user.id)
    return res.json({ message: 'User account deleted successfully', userId: deletedUser.id })
  }
}
