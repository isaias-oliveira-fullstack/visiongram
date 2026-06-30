import api from '@/services/api'
import type { LoginInput, RegisterInput, User } from '@/common'

export interface AuthResponse {
  user: User
  token: string
}

export const authService = {
  async login(payload: LoginInput) {
    return api.post<AuthResponse>('/auth/login', {
      emailOrUsername: payload.username,
      password: payload.password
    })
  },

  async register(payload: RegisterInput) {
    return api.post<AuthResponse>('/auth/register', {
      firstName: payload.firstName,
      lastName: payload.lastName,
      name: `${payload.firstName ?? ''} ${payload.lastName ?? ''}`.trim(),
      username: payload.username,
      email: payload.email,
      password: payload.password,
      avatar: payload.avatar,
      bio: payload.bio
    })
  },

  async fetchMe() {
    return api.get<User>('/auth/me')
  },

  async updateProfile(userId: string, data: Partial<{ name?: string; firstName?: string; lastName?: string; username?: string; email?: string; bio?: string; avatar?: string; gender?: string }>) {
    return api.put<User>(`/users/${userId}`, data)
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    return api.put(`/users/${userId}/password`, { currentPassword, newPassword })
  },

  async deleteAccount() {
    return api.delete('/users/me')
  },

  async forgotPassword(emailOrUsername: string) {
    return api.post('/auth/forgot-password', { emailOrUsername })
  },

  async resetPassword(token: string, newPassword: string) {
    return api.post('/auth/reset-password', { token, password: newPassword })
  }
}
