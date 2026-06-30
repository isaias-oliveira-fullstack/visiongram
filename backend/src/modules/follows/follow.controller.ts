import { Request, Response } from 'express'
import { FollowService } from './follow.service'

export class FollowController {
  private followService = new FollowService()

  async follow(req: Request, res: Response) {
    const followerId = req.user.id
    const followingId = req.params.id
    const follow = await this.followService.follow(followerId, followingId)
    return res.status(201).json(follow)
  }

  async unfollow(req: Request, res: Response) {
    const followerId = req.user.id
    const followingId = req.params.id
    await this.followService.unfollow(followerId, followingId)
    return res.status(204).send()
  }

  async followers(req: Request, res: Response) {
    const followers = await this.followService.getFollowers(req.params.id)
    return res.json(followers)
  }

  async following(req: Request, res: Response) {
    const following = await this.followService.getFollowing(req.params.id)
    return res.json(following)
  }
}
