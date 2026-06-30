import path from 'node:path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

// garante que erros assíncronos de rotas sejam encaminhados para os handlers de erro do Express
import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import net from 'node:net'
import os from 'node:os'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
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

app.use(errorHandler)

const execAsync = promisify(exec)
const DEFAULT_PORT = 3000
const requestedPort = Number(process.env.PORT ?? DEFAULT_PORT)
const port = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : DEFAULT_PORT

const getProcessInfoForPort = async (portNumber: number) => {
  const portInfo: { pid: number | null; command?: string } = { pid: null }
  if (os.platform() === 'win32') {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${portNumber}`)
      const line = stdout.split(/\r?\n/).find((row) => row.trim().length > 0)
      if (line) {
        const parts = line.trim().split(/\s+/)
        const pid = Number(parts[parts.length - 1])
        if (!Number.isNaN(pid)) {
          portInfo.pid = pid
          const tasklist = await execAsync(`tasklist /FI "PID eq ${pid}" /FO LIST`)
          const nameLine = tasklist.stdout.split(/\r?\n/).find((row) => row.startsWith('Image Name:'))
          if (nameLine) {
            portInfo.command = nameLine.split(':').slice(1).join(':').trim()
          }
        }
      }
    } catch {
      // ignora este erro esperado
    }
  } else {
    try {
      const { stdout } = await execAsync(`lsof -nP -iTCP:${portNumber} -sTCP:LISTEN`)
      const line = stdout.split(/\r?\n/).find((row) => row.trim().length > 0 && !row.startsWith('COMMAND'))
      if (line) {
        const parts = line.trim().split(/\s+/)
        const pid = Number(parts[1])
        if (!Number.isNaN(pid)) {
          portInfo.pid = pid
          portInfo.command = parts[0]
        }
      }
    } catch {
      // ignora este erro esperado
    }
  }
  return portInfo
}

const formatPortOccupiedMessage = async (portNumber: number) => {
  const info = await getProcessInfoForPort(portNumber)
  if (info.pid) {
    return `Port ${portNumber} is already in use by PID ${info.pid}${info.command ? ` (${info.command})` : ''}.` +
      ` Stop that process or set PORT to another value in backend/.env and update VITE_API_BASE_URL in frontend .env.`
  }
  return `Port ${portNumber} is already in use. Please stop the other process or set a different PORT in backend/.env.`
}

const handleStartupError = (message: string, error?: NodeJS.ErrnoException) => {
  console.error(message)
  if (error && error.code !== 'EADDRINUSE') {
    console.error('Server startup error:', error)
  }
  process.exit(1)
}

const startServer = async () => {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
  })

  server.on('error', async (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      const message = await formatPortOccupiedMessage(port)
      handleStartupError(message, error)
    } else {
      handleStartupError('Server startup error:', error)
    }
  })
}

startServer()
