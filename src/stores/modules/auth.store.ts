import { defineStore } from 'pinia'
import { authService } from '@/services/auth.service'
import type { RegisterInput, User, LoginInput } from '@/common'
import { normalizeGenderValue } from '@/common/helpers'

/**
 * Payload mínimo de autenticação para o localStorage
 * Persiste os dados essenciais de autenticação e os IDs das relações de follow para validação rápida
 */
interface MinimalAuthPayload {
  id: string
  token: string
  userName: string
  firstName?: string
  lastName?: string
  gender?: string
  biography?: string
  email?: string
  profilePictureUrl?: string
  followerCount?: number
  followingCount?: number
  followingIds?: string[]
  followerIds?: string[]
}

const splitDisplayName = (fullName?: string) => {
  const [first = '', ...rest] = (fullName ?? '').trim().split(' ')
  return {
    firstName: first,
    lastName: rest.length ? rest.join(' ') : first
  }
}

/**
 * Extrai os dados mínimos de autenticação para persistência no localStorage
 * Inclui os IDs das relações de follow para validação rápida sem carregar objetos completos
 */
const extractMinimalAuthPayload = (user: User): MinimalAuthPayload => ({
  id: user.id,
  token: '', // O token é armazenado separadamente
  userName: user.userName,
  firstName: user.firstName,
  lastName: user.lastName,
  gender: user.gender,
  biography: user.biography,
  email: user.email,
  profilePictureUrl: user.profilePictureUrl,
  followerCount: user.followerCount,
  followingCount: user.followingCount,
  followingIds: user.following?.map(f => f.id) ?? [],
  followerIds: user.followers?.map(f => f.id) ?? []
})

const normalizeUser = (rawUser: any): User => {
  // Prioriza firstName/lastName explícitos; caso contrário, separa o nome exibido
  const firstName = rawUser.firstName ?? splitDisplayName(rawUser.name ?? rawUser.fullName).firstName
  const lastName = rawUser.lastName ?? splitDisplayName(rawUser.name ?? rawUser.fullName).lastName

  const normalizeRelationUser = (relation: any, key: 'follower' | 'following') => {
    if (!relation) return null
    const userObj = relation[key] ?? relation
    return {
      id: userObj.id ?? '',
      firstName: splitDisplayName(userObj.name).firstName,
      lastName: splitDisplayName(userObj.name).lastName,
      userName: userObj.username ?? userObj.userName ?? '',
      profilePictureUrl: userObj.avatar ?? userObj.profilePictureUrl ?? ''
    }
  }

  const rawFollowers = Array.isArray(rawUser.followers) ? rawUser.followers : []
  const rawFollowing = Array.isArray(rawUser.following) ? rawUser.following : []

  const followers = rawFollowers.map((r: any) => normalizeRelationUser(r, 'follower')).filter(Boolean)
  const following = rawFollowing.map((r: any) => normalizeRelationUser(r, 'following')).filter(Boolean)

  return {
    id: rawUser.id,
    firstName,
    lastName,
    userName: rawUser.username ?? rawUser.userName ?? '',
    gender: normalizeGenderValue(rawUser.gender),
    profilePictureUrl: rawUser.avatar ?? rawUser.profilePictureUrl ?? '',
    email: rawUser.email,
    mediaCount: rawUser.mediaCount ?? rawUser.mediaItems?.length ?? 0,
    followerCount: rawUser.followerCount ?? followers.length,
    followingCount: rawUser.followingCount ?? following.length,
    friendShip: rawUser.friendShip ?? { following: false },
    followers,
    following,
    isVerified: rawUser.isVerified ?? false,
    isSuperuser: rawUser.isSuperuser ?? false,
    lastLogin: rawUser.lastLogin ?? undefined,
    dateJoined: rawUser.createdAt ?? rawUser.dateJoined ?? '',
    lastModifiedAt: rawUser.updatedAt ?? rawUser.lastModifiedAt ?? undefined,
    biography: rawUser.bio ?? rawUser.biography ?? '',
    mediaItems: rawUser.mediaItems ?? []
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isLoading: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user
  },
  actions: {
    async initialize() {
      const rawToken = localStorage.getItem('token')
      const storedMinimalAuth = localStorage.getItem('user')
      const token = rawToken && rawToken !== 'null' && rawToken !== 'undefined' ? rawToken : null

      if (rawToken && !token) {
        // valor de token inválido encontrado no armazenamento; remove-o
        localStorage.removeItem('token')
      }

      // status de inicialização disponível para a view

      if (token) {
        this.token = token
      }

      // Inicializa os dados mínimos de autenticação do armazenamento local para acesso rápido
      if (storedMinimalAuth && storedMinimalAuth !== 'null' && storedMinimalAuth !== 'undefined') {
        try {
          const minimalAuth = JSON.parse(storedMinimalAuth)
          // Cria um objeto temporário mínimo com os dados de autenticação armazenados
          // Esse objeto será substituído pelos dados completos vindos de fetchMe()
          if (minimalAuth.id && minimalAuth.userName) {
            // Reconstrói os relacionamentos de seguindo/seguidores a partir dos IDs salvos para validações rápidas
            const followingUsers = (minimalAuth.followingIds ?? []).map((id: string) => ({
              id,
              firstName: '',
              lastName: '',
              userName: '',
              profilePictureUrl: '',
              gender: 'Other',
              email: '',
              followerCount: 0,
              followingCount: 0,
              dateJoined: '',
              mediaItems: [],
              followers: [],
              following: [],
              isVerified: false,
              isSuperuser: false,
              biography: ''
            }))

            const followerUsers = (minimalAuth.followerIds ?? []).map((id: string) => ({
              id,
              firstName: '',
              lastName: '',
              userName: '',
              profilePictureUrl: '',
              gender: 'Other',
              email: '',
              followerCount: 0,
              followingCount: 0,
              dateJoined: '',
              mediaItems: [],
              followers: [],
              following: [],
              isVerified: false,
              isSuperuser: false,
              biography: ''
            }))

            this.user = {
              id: minimalAuth.id,
              firstName: minimalAuth.firstName ?? minimalAuth.userName.split('.')[0] ?? '',
              lastName: minimalAuth.lastName ?? '',
              userName: minimalAuth.userName,
              gender: normalizeGenderValue(minimalAuth.gender),
              profilePictureUrl: minimalAuth.profilePictureUrl ?? '',
              email: minimalAuth.email ?? '',
              followerCount: minimalAuth.followerCount ?? 0,
              followingCount: minimalAuth.followingCount ?? 0,
              dateJoined: '',
              mediaItems: [],
              followers: followerUsers,
              following: followingUsers,
              isVerified: false,
              isSuperuser: false,
              biography: minimalAuth.biography ?? ''
            }
          }
        } catch (error) {
          // falha ao interpretar o payload mínimo de autenticação salvo; remove-o
          localStorage.removeItem('user')
        }
      } else if (storedMinimalAuth) {
        localStorage.removeItem('user')
      }

      if (token) {
        try {
          await this.fetchMe()
        } catch (error: any) {
          const status = error?.response?.status
          if (status === 401 || status === 403) {
            this.clearAuth()
          }
        }
      }
    },

    setAuth(user: User, token: string) {
      this.user = normalizeUser(user)
      this.token = token
      localStorage.setItem('token', token)
      
      // Armazena apenas o payload mínimo de autenticação para evitar exceder a cota
      const minimalPayload = extractMinimalAuthPayload(this.user)
      minimalPayload.token = token
      localStorage.setItem('user', JSON.stringify(minimalPayload))
    },

    updateLocalStorageUser() {
      if (this.user && this.token) {
        const minimalPayload = extractMinimalAuthPayload(this.user)
        minimalPayload.token = this.token
        localStorage.setItem('user', JSON.stringify(minimalPayload))
      }
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    async login(payload: LoginInput) {
      this.isLoading = true
      this.error = null

      try {
        const response = await authService.login(payload)
        const { user, token } = response.data
        this.setAuth(user, token)
        return this.user
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Falha no login'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async register(payload: RegisterInput) {
      this.isLoading = true
      this.error = null

      try {
        const response = await authService.register(payload)
        const { user, token } = response.data
        this.setAuth(user, token)
        return this.user
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Falha no cadastro'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchMe() {
      if (!this.token) {
        return null
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await authService.fetchMe()
        const user = normalizeUser(response.data)
        if (this.token) {
          this.user = user
          const minimalPayload = extractMinimalAuthPayload(user)
          minimalPayload.token = this.token
          localStorage.setItem('user', JSON.stringify(minimalPayload))
        }
        return user
      } catch (error: any) {
        const status = error?.response?.status
        const message = error?.response?.data?.message ?? error.message ?? 'Não foi possível buscar o usuário autenticado'
        this.error = message
        if (status === 401 || status === 403) {
          this.clearAuth()
        }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      this.clearAuth()
    }
  }
})
