import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors'

export function errorHandler(err: Error & { status?: number; statusCode?: number }, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  const status = err.status ?? err.statusCode
  if (typeof status === 'number' && status >= 400 && status < 600) {
    console.error(err)
    return res.status(status).json({ message: err.message })
  }

  console.error(err)
  return res.status(500).json({ message: 'Internal server error' })
}
