import { defineStore } from 'pinia'
import api from '@/services/api'
import { useAuthStore } from '@/stores'
import type { PostCard, PostComment } from '@/common'

interface PostState {
  posts: PostCard[]
  savedPosts: PostCard[]
  isLoading: boolean
  error: string | null
}

const mapApiPostToPostCard = (post: any): PostCard => {
  const authStore = useAuthStore()

  const mapApiCommentToPostComment = (comment: any): PostComment => ({
    id: comment.id,
    userName: comment.user?.username ?? '',
    profilePictureUrl: comment.user?.avatar ?? '',
    content: comment.content,
    createdAt: new Date(comment.createdAt).toLocaleDateString('en-US'),
    parentCommentId: comment.parentCommentId,
    replies: Array.isArray(comment.replies)
      ? comment.replies.map(mapApiCommentToPostComment)
      : []
  })

  const comments: PostComment[] = Array.isArray(post.comments)
    ? post.comments.map(mapApiCommentToPostComment)
    : []

  // Verifica se o usuário atual curtiu esta publicação
  const hasLiked = Array.isArray(post.likes) 
    ? post.likes.some((like: any) => like.userId === authStore.user?.id)
    : false

  // Verifica se o usuário atual salvou esta publicação
  const isSaved = post.isSaved ?? false

  const primaryMediaUrl = post.mediaUrl ?? post.imageUrl
  const primaryMediaType = post.mediaType ?? (post.imageUrl
    ? 'image'
    : post.mediaUrl
      ? (/\.(mp4|mov|webm|m3u8)(\?.*)?$/i).test(post.mediaUrl)
        ? 'video'
        : 'image'
      : undefined)

  const defaultCarouselMedia = primaryMediaUrl
    ? [
        {
          index: 0,
          type: primaryMediaType === 'video' ? 'video' : 'image',
          mediaUrl: primaryMediaUrl,
          poster: post.thumbnailUrl ?? (primaryMediaType === 'video' ? post.imageUrl : undefined)
        }
      ]
    : undefined

  return {
    id: post.id,
    userName: post.user?.username ?? '',
    profilePictureUrl: post.user?.avatar ?? '',
    createdAt: new Date(post.createdAt).toLocaleDateString('en-US'),
    caption: post.content,
    likeCount: Array.isArray(post.likes) ? post.likes.length : 0,
    hasLiked: hasLiked,
    isFollowed: false,
    commentCount: comments.length,
    comments,
    carouselMedia: Array.isArray(post.carouselMedia) && post.carouselMedia.length > 0 ? post.carouselMedia : defaultCarouselMedia,
    imageUrl: post.imageUrl,
    mediaUrl: post.mediaUrl,
    mediaType: post.mediaType,
    thumbnailUrl: post.thumbnailUrl,
    userId: post.userId,
    isSaved: isSaved,
    hideLikes: post.hideLikes ?? false,
    disableComments: post.disableComments ?? false
  }
}

export const usePostStore = defineStore('post', {
  state: (): PostState => ({
    posts: [],
    savedPosts: [],
    isLoading: false,
    error: null
  }),
  actions: {
    async fetchFeed() {
      this.isLoading = true
      this.error = null
      this.posts = []

      try {
        const response = await api.get('/posts')
        this.posts = response.data.map(mapApiPostToPostCard)
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to load feed'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async fetchByUsername(username: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.get(`/posts?username=${encodeURIComponent(username)}`)
        this.posts = response.data.map(mapApiPostToPostCard)
        return this.posts
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to load posts for user'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchPostById(id: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.get(`/posts/${id}`)
        const post = mapApiPostToPostCard(response.data)
        const existingPostIndex = this.posts.findIndex((item) => item.id === post.id)
        if (existingPostIndex >= 0) {
          this.posts.splice(existingPostIndex, 1, post)
        } else {
          this.posts.unshift(post)
        }
        return post
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to load post'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async toggleLike(postId: string) {
      const postIndex = this.posts.findIndex((item) => item.id === postId)
      if (postIndex < 0) {
        return
      }

      const post = this.posts[postIndex]
      const shouldLike = !post.hasLiked
      this.error = null

      try {
        let response
        if (shouldLike) {
          response = await api.post(`/posts/${postId}/like`)
        } else {
          response = await api.delete(`/posts/${postId}/like`)
        }

        // Atualiza a publicação com os dados da resposta, que incluem as relações atualizadas
        const updatedPost = mapApiPostToPostCard(response.data)
        this.posts.splice(postIndex, 1, updatedPost)
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to update like state'
        throw error
      }
    },

    async createPost(content: string, mediaUrl?: string, mediaType?: 'image' | 'video', thumbnailUrl?: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.post('/posts', { content, mediaUrl, mediaType, thumbnailUrl, imageUrl: mediaType === 'image' ? mediaUrl : undefined })
        const createdPost = mapApiPostToPostCard(response.data)
        this.posts.unshift(createdPost)
        return createdPost
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to create post'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updatePost(postId: string, data: { content?: string; imageUrl?: string; mediaUrl?: string; mediaType?: 'image' | 'video'; thumbnailUrl?: string; hideLikes?: boolean; disableComments?: boolean }) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.put(`/posts/${postId}`, data)
        const updatedPost = mapApiPostToPostCard(response.data)
        const postIndex = this.posts.findIndex((item) => item.id === postId)
        if (postIndex >= 0) {
          this.posts.splice(postIndex, 1, updatedPost)
        }
        return updatedPost
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to update post'
        throw error
      } finally {
        this.isLoading = false
      }
    }
    ,
    async deletePost(postId: string) {
      this.isLoading = true
      this.error = null

      try {
        await api.delete(`/posts/${postId}`)

        const removeFromList = (list: PostCard[]) => {
          const index = list.findIndex((item) => item.id === postId)
          if (index >= 0) {
            list.splice(index, 1)
          }
        }

        removeFromList(this.posts)
        removeFromList(this.savedPosts)

        return true
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to delete post'
        throw error
      } finally {
        this.isLoading = false
      }
    }
    ,
    async createComment(postId: string, content: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.post(`/posts/${postId}/comments`, { content })
        const comment = response.data
        const mapped = {
          id: comment.id,
          userName: comment.user?.username ?? '',
          profilePictureUrl: comment.user?.avatar ?? '',
          content: comment.content,
          createdAt: comment.createdAt
        }

        await this.fetchPostById(postId)
        return mapped
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to create comment'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async deleteComment(postId: string, commentId: string) {
      this.isLoading = true
      this.error = null

      try {
        await api.delete(`/posts/${postId}/comments/${commentId}`)
        await this.fetchPostById(postId)
        return true
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to delete comment'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async createReply(postId: string, commentId: string, content: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.post(`/posts/${postId}/comments`, { 
          content,
          parentCommentId: commentId
        })
        const reply = response.data
        const mapped = {
          id: reply.id,
          userName: reply.user?.username ?? '',
          profilePictureUrl: reply.user?.avatar ?? '',
          content: reply.content,
          createdAt: reply.createdAt,
          parentCommentId: reply.parentCommentId
        }

        await this.fetchPostById(postId)
        return mapped
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to create reply'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async savePost(postId: string) {
      const postIndex = this.posts.findIndex((item) => item.id === postId)
      if (postIndex < 0) {
        return
      }

      const post = this.posts[postIndex]
      this.error = null

      // Optimistic update: mark as saved immediately
      const previous = { ...post }
      post.isSaved = true
      this.posts.splice(postIndex, 1, post)

      try {
        const response = await api.post(`/posts/${postId}/save`)
        const updatedPost = mapApiPostToPostCard(response.data)

        // Atualiza as listas que contêm a publicação
        const updateList = (list: PostCard[]) => {
          const index = list.findIndex((item) => item.id === updatedPost.id)
          if (index >= 0) {
            list.splice(index, 1, updatedPost)
          }
        }

        updateList(this.posts)
        updateList(this.savedPosts)

        const savedIndex = this.savedPosts.findIndex((p) => p.id === updatedPost.id)
        if (savedIndex < 0) {
          this.savedPosts.unshift(updatedPost)
        }
      } catch (error: any) {
        // rollback optimistic update
        this.posts.splice(postIndex, 1, previous)
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to save post'
        throw error
      }
    },
    async unsavePost(postId: string) {
      const postIndex = this.posts.findIndex((item) => item.id === postId)
      const savedIndex = this.savedPosts.findIndex((item) => item.id === postId)
      if (postIndex < 0 && savedIndex < 0) {
        return
      }

      const post = postIndex >= 0 ? this.posts[postIndex] : this.savedPosts[savedIndex]
      this.error = null

      const previousPost = { ...post }

      if (postIndex >= 0) {
        const updated = { ...post, isSaved: false }
        this.posts.splice(postIndex, 1, updated)
      }

      if (savedIndex >= 0) {
        const updated = { ...post, isSaved: false }
        this.savedPosts.splice(savedIndex, 1, updated)
      }

      try {
        const response = await api.delete(`/posts/${postId}/save`)
        const updatedPost = mapApiPostToPostCard(response.data)

        const updateList = (list: PostCard[]) => {
          const index = list.findIndex((item) => item.id === updatedPost.id)
          if (index >= 0) {
            list.splice(index, 1, updatedPost)
          }
        }

        updateList(this.posts)
        updateList(this.savedPosts)

        const removeIndex = this.savedPosts.findIndex((p) => p.id === updatedPost.id)
        if (removeIndex >= 0) {
          this.savedPosts.splice(removeIndex, 1)
        }
      } catch (error: any) {
        if (postIndex >= 0) {
          this.posts.splice(postIndex, 1, previousPost)
        }
        if (savedIndex >= 0) {
          this.savedPosts.splice(savedIndex, 1, previousPost)
        }
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to remove saved post'
        throw error
      }
    },
    async fetchSavedPosts() {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.get('/posts/me/saved-posts')
        this.savedPosts = response.data.map(mapApiPostToPostCard)
        return this.savedPosts
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? error.message ?? 'Unable to load saved posts'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})
