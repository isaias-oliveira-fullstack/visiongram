export class AppError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
  }
}

export const notFound = (message = 'Resource not found') => new AppError(message, 404)
export const unauthorized = (message = 'Unauthorized') => new AppError(message, 401)
export const badRequest = (message = 'Bad request') => new AppError(message, 400)
