import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { unauthorized } from '../errors'

interface JwtPayload {
  sub: string
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    throw unauthorized('JWT token is missing')
  }

  const [, token] = authHeader.split(' ')

  if (!token) {
    throw unauthorized('JWT token is missing')
  }

  try {
    const secret = process.env.JWT_SECRET ?? 'secret'
    const payload = jwt.verify(token, secret) as any

    // Suporta ambos os campos "sub" (padrão) e "id" (legado)
    const userId = payload.sub || payload.id

    if (!userId) {
      throw unauthorized('Invalid JWT token: missing user ID')
    }

    req.user = {
      id: userId
    }

    return next()
  } catch (error: any) {
    if (error.message && error.message.includes('Invalid JWT token')) {
      throw error
    }
    throw unauthorized('Invalid JWT token')
  }
}
