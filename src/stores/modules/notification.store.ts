import { defineStore } from 'pinia'
import api from '@/services/api'
import type { NotificationCard } from '@/common'

interface NotificationState {
  notifications: NotificationCard[]
  isLoading: boolean
  error: string | null
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
    isLoading: false,
    error: null
  }),
  actions: {
    async fetchNotifications() {
      this.isLoading = true
      this.error = null
      try {
        const resp = await api.get('/notifications')
        // Converte o formato do backend para o modelo NotificationCard
        this.notifications = resp.data.map((n: any) => ({
          id: n.id,
          userName: n.actor?.username ?? 'unknown',
          profilePictureUrl: n.actor?.avatar ?? '',
          createdAt: n.createdAt,
          caption: n.type === 'like' ? 'liked your post' : (n.type === 'comment' ? 'commented on your post' : 'started following you'),
          type: n.type,
          isFollowing: false
        }))
        return this.notifications
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? e.message ?? 'Unable to load notifications'
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async markAsRead(id: string) {
      await api.post(`/notifications/${id}/read`)
      const idx = this.notifications.findIndex(n => n.id === id)
      if (idx >= 0) this.notifications[idx].caption += ' • read'
    }
  }
})
