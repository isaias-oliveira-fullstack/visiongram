import nodemailer from 'nodemailer'
import { AppError } from '../errors'

const MAIL_HOST = process.env.MAIL_HOST
const MAIL_PORT = Number(process.env.MAIL_PORT ?? '587')
const MAIL_SECURE = process.env.MAIL_SECURE === 'true'
const MAIL_USER = process.env.MAIL_USER
const MAIL_PASS = process.env.MAIL_PASS
const MAIL_FROM = process.env.MAIL_FROM ?? MAIL_USER

const transporter = MAIL_HOST && MAIL_USER && MAIL_PASS ? nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_SECURE,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS
  }
}) : null

export class MailService {
  async sendMail(to: string, subject: string, html: string) {
    if (!transporter || !MAIL_HOST || !MAIL_USER || !MAIL_PASS) {
      throw new AppError('Mail transport is not configured. Please set MAIL_HOST, MAIL_USER and MAIL_PASS in backend/.env.', 500)
    }

    try {
      await transporter.sendMail({
        from: MAIL_FROM,
        to,
        subject,
        html
      })
    } catch (error: any) {
      throw new AppError(`Unable to send email: ${error?.message ?? 'unknown error'}`, 500)
    }
  }
}
