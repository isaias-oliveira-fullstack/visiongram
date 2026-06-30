import { Router } from 'express';
import { SavedPostController } from './saved-post.controller';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';

const savedPostRoutes = Router();
const savedPostController = new SavedPostController();

// POST /posts/:id/save (Salva um post na lista do usuário)
savedPostRoutes.post(
  '/:id/save',
  ensureAuthenticated,
  (req, res) => savedPostController.create(req, res)
);

// DELETE /posts/:id/save (Remove um post da lista de salvos)
savedPostRoutes.delete(
  '/:id/save',
  ensureAuthenticated,
  (req, res) => savedPostController.remove(req, res)
);

// GET /me/saved-posts (Retorna todos os posts salvos do usuário autenticado)
savedPostRoutes.get(
  '/me/saved-posts',
  ensureAuthenticated,
  (req, res) => savedPostController.findAll(req, res)
);

export { savedPostRoutes };
