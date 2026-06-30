import path from 'node:path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import authRoutes from './modules/auth/auth.routes'
import userRoutes from './modules/users/user.routes'
import postRoutes from './modules/posts/post.routes'
import likeRoutes from './modules/likes/like.routes'
import commentRoutes from './modules/comments/comment.routes'
import followRoutes from './modules/follows/follow.routes'
import notificationRoutes from './modules/notifications/notification.routes'
import { savedPostRoutes } from './modules/saved-posts/saved-post.routes'
import { errorHandler } from './shared/middlewares/error.middleware'

const app = express()

console.log('Backend app initialized')

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/posts', likeRoutes)
app.use('/posts', commentRoutes)
app.use('/posts', savedPostRoutes)
app.use('/posts', postRoutes)
app.use('/users', followRoutes)
app.use('/notifications', notificationRoutes)

app.get('/', (_req, res) => {
  console.log('Backend root route hit')
  res.json({ message: 'VisionGram backend API is running' })
})

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use(errorHandler)

export default app
