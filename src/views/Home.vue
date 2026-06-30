<template>
  <div class="mx-auto flex w-full max-w-243.75 flex-col px-3 pb-10 pt-3 sm:px-4 sm:pt-6 lg:flex-row lg:justify-center lg:gap-8 lg:pt-8">
    <div class="flex w-full max-w-117.5 flex-col gap-4 lg:mx-0 lg:flex-1">
      <div class="overflow-hidden rounded-3xl border border-[#262626] bg-[#121212] shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <StoryCarousel
          v-if="stories.length > 0"
          :reels="stories" />
      </div>

      <div class="flex flex-col gap-5">
        <PostCard
          v-for="(item, index) of posts"
          :key="item.id ?? index"
          :post="item"
          @on-open-comment-modal="triggerCommentModal"
          @on-post-like="changeLikeState"
          @on-post-comment="handlePostComment"
          @on-post-save="onPostSave" />
      </div>
    </div>

    <div class="hidden w-[320px] shrink-0 pt-3 lg:block">
      <SuggestionCard
        v-if="suggested"
        :card-item="suggested"
        @followToggle="toggleFollow" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import api from '@/services/api'
import { usePostStore, useUserStore, useAuthStore } from '@/stores'
import { SuggestionCard, PostCard, StoryCarousel } from '@/components'
import { DEFAULT_PROFILE_PICTURE } from '@/common/constants'
import { resolvePostMediaList, type PostCard as PostCardType, type PostMedia, type SuggestionCard as SuggestionCardType, type StoryCarousel as StoryCarouselType } from '@/common'

const postStore = usePostStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const posts = computed(() => postStore.posts)

const mapPostsToStories = (postCards: PostCardType[]): StoryCarouselType[] => {
  const uniqueUsers = new Set<string>()
  return postCards.reduce<StoryCarouselType[]>((stories, post) => {
    if (stories.length >= 10) {
      return stories
    }

    if (!uniqueUsers.has(post.userName)) {
      const avatar = post.profilePictureUrl || DEFAULT_PROFILE_PICTURE
      const mediaItems: PostMedia[] = resolvePostMediaList(post)

      if (mediaItems.length > 0) {
        uniqueUsers.add(post.userName)
        stories.push({
          id: Number(post.id) || stories.length + 1,
          userName: post.userName,
          profilePictureUrl: avatar,
          expiringAt: '24h',
          seen: false,
          hasLiked: post.hasLiked,
          items: mediaItems,
          mediaCount: mediaItems.length
        })
      }
    }

    return stories
  }, [])
}

const stories = computed<StoryCarouselType[]>(() => mapPostsToStories(posts.value))
const suggested = ref<SuggestionCardType | undefined>(undefined)

const buildSuggested = (): SuggestionCardType | undefined => {
  const currentUser = authStore.user
  if (!currentUser || !userStore.users.length) {
    return undefined
  }

  const followingUserNames = currentUser.following?.map((item) => item.userName) ?? []
  const suggestions = userStore.users
    .filter((user) => user.userName !== currentUser.userName)
    .slice(0, 5)
    .map((user) => ({
      id: user.id,
      userName: user.userName,
      profilePictureUrl: user.profilePictureUrl || DEFAULT_PROFILE_PICTURE,
      followedBy: user.followers?.[0]?.userName || 'Popular',
      isFollowing: followingUserNames.includes(user.userName)
    }))

  return {
    userName: currentUser.userName,
    profilePictureUrl: currentUser.profilePictureUrl || DEFAULT_PROFILE_PICTURE,
    suggested: suggestions
  }
}

const toggleFollow = async (profileId?: string) => {
  if (!profileId || !suggested.value) return

  const item = suggested.value.suggested.find((suggest) => suggest.id === profileId)
  if (!item) return

  try {
    if (item.isFollowing) {
      await api.delete(`/users/${profileId}/follow`)
      item.isFollowing = false
    } else {
      await api.post(`/users/${profileId}/follow`)
      item.isFollowing = true
    }
  } catch {
    // ignora falhas de seguir/deixar de seguir por enquanto
  }
}

const commentModal = ref({
  isToggled: false,
  postId: ''
})

const changeLikeState = async (postId: string) => {
  try {
    await postStore.toggleLike(postId)
  } catch {
    // ignora falhas ao alternar o like por enquanto
  }
}

const handlePostComment = async (commentText: string, postId: string | undefined) => {
  if (!postId) return
  try {
    await postStore.createComment(postId, commentText)
  } catch {
    // ignora falhas por enquanto
  }
}

// Opções de post tratadas dentro do PostCard (abre modal de edição para proprietários)

const triggerCommentModal = (id: string | undefined) => {
  commentModal.value = {
    isToggled: !commentModal.value.isToggled,
    postId: id ?? ''
  }
}

const onPostSave = async (postId: string) => {
  if (!postId) return
  try {
    const post = postStore.posts.find((p) => p.id === postId)
    if (!post) return
    if (post.isSaved) {
      await postStore.unsavePost(postId)
    } else {
      await postStore.savePost(postId)
    }
  } catch {
    // ignora erros aqui; o store já expõe a mensagem apropriada
  }
}

const refreshSuggested = () => {
  suggested.value = buildSuggested()
}

watchEffect(refreshSuggested)

onMounted(() => {
  postStore.fetchFeed().catch(() => {
    // ignora erros de carregamento do feed por enquanto
  })

  userStore.fetchUsers().catch(() => {
    // ignora erros ao carregar sugestões por enquanto
  })
})
</script>
