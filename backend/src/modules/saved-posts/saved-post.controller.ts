import { Request, Response } from 'express';
import { SavedPostService } from './saved-post.service';
import { PostService } from '../posts/post.service';

const savedPostService = new SavedPostService();
const postService = new PostService();

export class SavedPostController {
  async create(req: Request, res: Response) {
    try {
      const { id: postId } = req.params;
      const userId = req.user!.id;

      const result = await savedPostService.save(userId, postId);

      const post = await postService.findOne(postId, userId);

      // Se created=true, retorna 201; caso contrário, 200 porque o post já estava salvo
      if (result?.created) {
        return res.status(201).json(post);
      }

      return res.status(200).json(post);
    } catch (error) {
      console.error('Error saving post:', error);
      res.status(500).json({ error: 'Failed to save post' });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id: postId } = req.params;
      const userId = req.user!.id;

      await savedPostService.unsave(userId, postId);

      const post = await postService.findOne(postId, userId);

      res.status(200).json(post);
    } catch (error) {
      console.error('Error removing saved post:', error);
      res.status(500).json({ error: 'Failed to remove saved post' });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const savedPosts = await savedPostService.findUserSavedPosts(userId);

      const postsWithCurrentUserData = await Promise.all(
        savedPosts.map((post: any) => postService.findOne(post.id, userId))
      );

      res.status(200).json(postsWithCurrentUserData);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      res.status(500).json({ error: 'Failed to fetch saved posts' });
    }
  }
}
