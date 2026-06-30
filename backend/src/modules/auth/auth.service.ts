import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../../database/prisma'
import { AppError } from '../../shared/errors'
import { MailService } from '../../shared/services/mail.service'

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret'
const FRONTEND_URL = resolveFrontendUrl()

function resolveFrontendUrl() {
  const configured = process.env.FRONTEND_URL?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  return 'http://localhost:5173'
}

interface RegisterInput {
  firstName?: string
  lastName?: string
  username: string
  email: string
  password: string
  avatar?: string
  bio?: string
}

interface LoginInput {
  emailOrUsername: string
  password: string
}

export class AuthService {
  private mailService = new MailService()

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  private buildResetUrl(token: string) {
    return `${FRONTEND_URL.replace(/\/$/, '')}/accounts/reset?token=${encodeURIComponent(token)}`
  }

  async forgotPassword(emailOrUsername: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      }
    })

    if (!user) {
      return
    }

    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = this.hashToken(rawToken)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30)

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt
      }
    })

    const resetUrl = this.buildResetUrl(rawToken)
    const subject = 'Redefinição de senha — VisionGram'
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111;background:#f4f6fb;padding:24px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.08);">
          <div style="padding:24px;text-align:center;background:#2563eb;color:#ffffff;">
            <h1 style="margin:0;font-size:24px;">VisionGram</h1>
            <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">Redefinição de senha</p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:16px;color:#1f2937;margin-bottom:24px;">Olá ${user.firstName ?? user.username},</p>
            <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px;">
              Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha para sua conta.
            </p>
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">
                Redefinir senha
              </a>
            </div>
            <p style="font-size:14px;color:#6b7280;line-height:1.7;margin-bottom:24px;">
              Caso o botão não funcione, copie e cole este link no navegador:
              <br /><a href="${resetUrl}" style="color:#2563eb;word-break:break-all;">${resetUrl}</a>
            </p>
            <p style="font-size:14px;color:#6b7280;line-height:1.7;">
              Este link expira em 30 minutos. Se você não solicitou essa alteração, apenas ignore este e-mail.
            </p>
          </div>
        </div>
      </div>`

    await this.mailService.sendMail(user.email, subject, html)
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = this.hashToken(token)

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      include: { user: true }
    })

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      throw new AppError('Invalid or expired reset token', 400)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword }
    })

    await prisma.passwordResetToken.updateMany({
      where: { userId: resetRecord.userId, usedAt: null },
      data: { usedAt: new Date() }
    })

    return { message: 'Senha redefinida com sucesso' }
  }

  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username }
        ]
      }
    })

    if (existingUser) {
      throw new AppError('Email or username already taken', 400)
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const fullName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim()

    const user = await prisma.user.create({
      data: {
        name: fullName || data.username || '',
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: hashedPassword,
        avatar: data.avatar,
        bio: data.bio
      }
    })

    const token = jwt.sign({}, JWT_SECRET, {
      subject: user.id,
      expiresIn: '7d'
    })

    // Busca o usuário com as relações de seguidores e seguindo
    const userWithFollows = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
        followers: {
          select: {
            follower: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        following: {
          select: {
            following: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    return {
      user: {
        id: userWithFollows?.id ?? user.id,
        firstName: userWithFollows?.firstName ?? user.firstName,
        lastName: userWithFollows?.lastName ?? user.lastName,
        name: userWithFollows?.name ?? user.name,
        username: userWithFollows?.username ?? user.username,
        email: userWithFollows?.email ?? user.email,
        avatar: userWithFollows?.avatar ?? user.avatar,
        bio: userWithFollows?.bio ?? user.bio,
        gender: userWithFollows?.gender,
        createdAt: userWithFollows?.createdAt ?? user.createdAt,
        updatedAt: userWithFollows?.updatedAt ?? user.updatedAt,
        followers: userWithFollows?.followers.map((r: any) => r.follower) ?? [],
        following: userWithFollows?.following.map((r: any) => r.following) ?? [],
        followerCount: userWithFollows?.followers.length ?? 0,
        followingCount: userWithFollows?.following.length ?? 0
      },
      token
    }
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.emailOrUsername },
          { username: data.emailOrUsername }
        ]
      }
    })

    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password)

    if (!passwordMatches) {
      throw new AppError('Invalid credentials', 401)
    }

    const token = jwt.sign({}, JWT_SECRET, {
      subject: user.id,
      expiresIn: '7d'
    })

    // Busca o usuário com as relações de seguidores e seguindo
    const userWithFollows = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
        followers: {
          select: {
            follower: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        following: {
          select: {
            following: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    return {
      user: {
        id: userWithFollows?.id ?? user.id,
        firstName: userWithFollows?.firstName ?? user.firstName,
        lastName: userWithFollows?.lastName ?? user.lastName,
        name: userWithFollows?.name ?? user.name,
        username: userWithFollows?.username ?? user.username,
        email: userWithFollows?.email ?? user.email,
        avatar: userWithFollows?.avatar ?? user.avatar,
        bio: userWithFollows?.bio ?? user.bio,
        gender: userWithFollows?.gender,
        createdAt: userWithFollows?.createdAt ?? user.createdAt,
        updatedAt: userWithFollows?.updatedAt ?? user.updatedAt,
        followers: userWithFollows?.followers.map((r: any) => r.follower) ?? [],
        following: userWithFollows?.following.map((r: any) => r.following) ?? [],
        followerCount: userWithFollows?.followers.length ?? 0,
        followingCount: userWithFollows?.following.length ?? 0
      },
      token
    }
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        gender: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        followers: {
          select: {
            follower: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        following: {
          select: {
            following: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      followers: user.followers.map((relation: { follower: { id: string; name: string; username: string; avatar: string | null } }) => relation.follower),
      following: user.following.map((relation: { following: { id: string; name: string; username: string; avatar: string | null } }) => relation.following),
      followerCount: user.followers.length,
      followingCount: user.following.length
    }
  }
}
