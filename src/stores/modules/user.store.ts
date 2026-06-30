import { defineStore } from 'pinia'
import api from '@/services/api'
import type { User } from '@/common'

interface UserState {
  users: User[] 
  profile: User | null
  isLoading: boolean
  error: string | null
}

const splitName = (name?: string) => {
  const [first = ''] = name?.split(' ') ?? ['']
  const [, ...rest] = name?.split(' ') ?? ['']
  return {
    firstName: first,
    lastName: rest.length ? rest.join(' ') : first
  }
}

const mapApiUserToUser = (rawUser: any): User => {
  const getRelationUser = (relation: any, key: 'follower' | 'following') => {
    if (!relation) {
      return null
    }
    // Se a relação já vier com os dados do usuário diretamente, usa esses dados já normalizados pelo backend
    if (relation.id) {
      return relation
    }
    // Otherwise, extract from nested structure
    if (relation[key]) {
      return relation[key]
    }
    return relation
  }

  const { firstName, lastName } = splitName(rawUser.name)
  
  const followers = Array.isArray(rawUser.followers)
    ? rawUser.followers.map((relation: any) => {
        const user = getRelationUser(relation, 'follower')
        return {
          id: user?.id ?? '',
          firstName: splitName(user?.name).firstName,
          lastName: splitName(user?.name).lastName,
          userName: user?.username ?? user?.userName ?? '',
          gender: user?.gender ?? 'Other',
          profilePictureUrl: user?.avatar ?? user?.profilePictureUrl ?? '',
          email: user?.email,
          followerCount: user?.followerCount ?? 0,
          followingCount: user?.followingCount ?? 0,
          dateJoined: user?.createdAt ?? user?.dateJoined,
          mediaItems: user?.mediaItems ?? [],
          isVerified: false,
          isSuperuser: false,
          biography: user?.bio ?? user?.biography ?? '',
          followers: [],
          following: [],
          friendShip: { following: false }
        }
      })
    : []

  const following = Array.isArray(rawUser.following)
    ? rawUser.following.map((relation: any) => {
        const user = getRelationUser(relation, 'following')
        return {
          id: user?.id ?? '',
          firstName: splitName(user?.name).firstName,
          lastName: splitName(user?.name).lastName,
          userName: user?.username ?? user?.userName ?? '',
          gender: user?.gender ?? 'Other',
          profilePictureUrl: user?.avatar ?? user?.profilePictureUrl ?? '',
          email: user?.email,
          followerCount: user?.followerCount ?? 0,
          followingCount: user?.followingCount ?? 0,
          dateJoined: user?.createdAt ?? user?.dateJoined,
          mediaItems: user?.mediaItems ?? [],
          isVerified: false,
          isSuperuser: false,
          biography: user?.bio ?? user?.biography ?? '',
          followers: [],
          following: [],
          friendShip: { following: false }
        }
      })
    : []

  return {
    id: rawUser.id,
    firstName: rawUser.firstName ?? firstName,
    lastName: rawUser.lastName ?? lastName,
    userName: rawUser.username ?? rawUser.userName ?? '',
    gender: rawUser.gender ?? 'Other',
    profilePictureUrl: rawUser.avatar ?? rawUser.profilePictureUrl ?? '',
    email: rawUser.email,
    mediaCount: rawUser.mediaCount ?? 0,
    followerCount: rawUser.followerCount ?? followers.length,
    followingCount: rawUser.followingCount ?? following.length,
    friendShip: rawUser.friendShip ?? {
      following: false
    },
    followers,
    following,
    isActive: rawUser.isActive ?? true,
    isPrivate: rawUser.isPrivate ?? false,
    isVerified: rawUser.isVerified ?? false,
    isSuperuser: rawUser.isSuperuser ?? false,
    lastLogin: rawUser.lastLogin,
    dateJoined: rawUser.createdAt ?? rawUser.dateJoined,
    lastModifiedAt: rawUser.updatedAt ?? rawUser.lastModifiedAt,
    biography: rawUser.bio ?? rawUser.biography ?? '',
    mediaItems: rawUser.mediaItems ?? []
  }
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    profile: null,
    isLoading: false,
    error: null
  }),
  actions: {
    async fetchUsers() {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.get('/users')
        this.users = response.data.map(mapApiUserToUser)
        return this.users
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to load users'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchUserById(id: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.get(`/users/${id}`)
        this.profile = mapApiUserToUser(response.data)
        return this.profile
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to load user profile'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async searchUsers(query: string) {
      await this.fetchUsers()
      const normalizedQuery = query.toLowerCase().trim()
      return this.users.filter((user) =>
        user.userName.toLowerCase().includes(normalizedQuery) ||
        user.email?.toLowerCase().includes(normalizedQuery) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(normalizedQuery)
      )
    },

    async fetchProfileByUsername(username: string) {
      const normalizedUsername = username.toLowerCase()
      const findMatch = (users: User[]) => users.find((user) => user.userName.toLowerCase() === normalizedUsername)

      if (!this.users.length) {
        await this.fetchUsers()
      }

      let match = findMatch(this.users)
      if (!match) {
        await this.fetchUsers()
        match = findMatch(this.users)
      }

      if (!match) {
        return null
      }

      if (match.id) {
        const profile = await this.fetchUserById(match.id)
        this.profile = profile
        return profile
      }

      this.profile = match
      return match
    }
  }
})
