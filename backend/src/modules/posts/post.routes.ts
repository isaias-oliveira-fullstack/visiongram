import { Router } from 'express'
import { PostController } from './post.controller'
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware'

const postRouter = Router()
const postController = new PostController()

postRouter.post('/', ensureAuthenticated, postController.create.bind(postController))
postRouter.get('/', postController.findAll.bind(postController))
// HTML público compartilhável para pré-visualização em redes sociais
postRouter.get('/share/:id', postController.share.bind(postController))
postRouter.get('/:id', postController.findOne.bind(postController))
postRouter.put('/:id', ensureAuthenticated, postController.update.bind(postController))
postRouter.delete('/:id', ensureAuthenticated, postController.delete.bind(postController))

export default postRouter
