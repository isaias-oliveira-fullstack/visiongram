<template>
  <div :class="isToggledClass" class="mx-auto min-h-screen w-full max-w-243.75 px-3 pb-10 pt-3 sm:px-4 sm:pt-6">
    <div class="flex flex-col gap-6 rounded-2xl border border-[#262626] bg-[#121212] p-4 sm:p-6">
      <ProfileHeader
        v-if="displayedProfile"
        :user="displayedProfile"
        :post-count="profilePostCount"
        :is-own-profile="isOwnProfile"
        :is-following="isFollowingProfile"
        @open-modal="toggleStatsModal"
        @toggle-follow="followProfile"
        @send-message="messageProfile"
      />

      <ProfileTabBar :current-tab="activeTab" @switch-tab="switchActiveTab" />

      <ProfileEmptyTabMessage
        :current-active-tab="activeTab"
        :is-post-tab-empty="false"
        :is-saved-tab-empty="isSavedTabEmpty"
        :is-peed-tab-empty="true"
        :is-tagged-tab-empty="true"
      />

      <PostCoverCardRenderer
        v-if="(activeTab === ProfileTab.Posts || activeTab === ProfileTab.Saved) && profilePosts.length"
        :posts="profilePosts"
      />

      <ProfileFooter />
    </div>
  </div>

    <StatsModal 
        :modal-size="ModalSize.Medium"
        :title="statsModal.title"
        :items="statsModal.stats"
        :is-toggled="statsModal.typeEnum === ModalName.FOLLOW && statsModal.isToggled"
        :modal-type="ModalName.FOLLOW"
        @on-modal-closed="toggleStatsModal"
        @on-action-click="handleStatsItemAction" />

    <ProfileSettingModal
        v-show="statsModal.type === ModalName.PROFILE_SETTING"
        @on-modal-closed="toggleStatsModal" />  
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { SmallModal as StatsModal, ProfileHeader, ProfileTabBar, ProfileEmptyTabMessage, PostCoverCardRenderer, ProfileFooter, ProfileSettingModal } from '@/components'
import { ProfileTab, ModalSize, ModalName, type NavBarTabs, type User, type PostCard as PostCardType } from '@/common'
import { useModalManagerStore, useAuthStore, useUserStore, usePostStore } from '@/stores'

const authStore = useAuthStore()
const userStore = useUserStore()
const postStore = usePostStore()
const route = useRoute()
const router = useRouter()
const modalStoreManager = useModalManagerStore()

const profile = ref<User | null>(null)
const displayedProfile = computed(() => {
  // Prioriza profile.value (perfil carregado do servidor)
  if (profile.value) {
    return profile.value
  }

  // Se não há profile carregado, verifica a rota
  const usernameParam = route.params.username as string | undefined
  if (!usernameParam) {
    // Sem username na rota = perfil próprio
    return authStore.user
  }

  // Com username na rota mas profile ainda não carregou
  // Retorna null para não usar um perfil errado
  return null
})

const posts = computed<PostCardType[]>(() => postStore.posts)
const savedPosts = computed<PostCardType[]>(() => postStore.savedPosts)
const profilePosts = computed<PostCardType[]>(() => {
  if (activeTab.value === ProfileTab.Saved) {
    // Retorna os posts salvos quando a aba de salvados estiver ativa
    return savedPosts.value
  }
  
  if (!displayedProfile.value) {
    return []
  }
  return posts.value.filter((post) => post.userName === displayedProfile.value?.userName)
})
const profilePostCount = computed(() => profilePosts.value.length)
const isOwnProfile = computed(() => authStore.user?.id === displayedProfile.value?.id)
const isSavedTabEmpty = computed(() => activeTab.value === ProfileTab.Saved && savedPosts.value.length === 0)
const isFollowingProfile = computed(() => {
  if (!authStore.user || !displayedProfile.value) {
    return false
  }
  return authStore.user.following?.some((item) => item.id === displayedProfile.value?.id) ?? false
})
const activeTab = ref<NavBarTabs>(ProfileTab.Posts)
const statsModal = ref({
  title: '',
  type: '',
  typeEnum: ModalName.PHOTO,
  stats: [] as any,
  isToggled: false
})

const switchActiveTab = (currentTab: NavBarTabs) => {
  activeTab.value = currentTab
}

watch(activeTab, async (tab) => {
  if (tab === ProfileTab.Saved && authStore.user && isOwnProfile.value) {
    await postStore.fetchSavedPosts().catch(() => {})
  }
})

const toggleStatsModal = ({ modalType, modalTitle }: { modalType?: string; modalTitle?: string } = {}) => {
  modalStoreManager.toggleModal(ModalName.FOLLOW)

  const items = displayedProfile.value
    ? modalTitle === 'Following'
      ? displayedProfile.value.following ?? []
      : displayedProfile.value.followers ?? []
    : []

  

  statsModal.value = {
    title: modalTitle ?? '',
    type: modalTitle ?? '',
    typeEnum: ModalName.FOLLOW,
    isToggled: !statsModal.value.isToggled,
    stats: items
  }
}

const resolveFollowTargetProfile = async (): Promise<User | null> => {
  const routeUsername = route.params.username as string | undefined
  if (routeUsername) {
    try {
      const resolved = await userStore.fetchProfileByUsername(routeUsername)
      if (resolved) {
        return resolved
      }
    } catch (error) {
      // falha silenciosa; a interface tratará o perfil ausente
    }
  }

  return displayedProfile.value
}

const followProfile = async () => {
  if (!authStore.token) {
    return
  }

  const targetProfile = await resolveFollowTargetProfile()
  if (!targetProfile?.id) {
    return
  }

  const targetUserId = targetProfile.id
  const isCurrentlyFollowing = isFollowingProfile.value

  try {
    // Executa a ação de seguir ou deixar de seguir
    if (isCurrentlyFollowing) {
      await api.delete(`/users/${targetUserId}/follow`)
    } else {
      await api.post(`/users/${targetUserId}/follow`)
    }

    // Atualiza o usuário autenticado e sincroniza as referências do perfil
    await authStore.fetchMe()

    if (profile.value?.id === authStore.user?.id) {
      profile.value = authStore.user
    } else if (profile.value?.id === targetUserId) {
      const refreshedProfile = await userStore.fetchUserById(targetUserId)
      profile.value = refreshedProfile
    }

    // Atualiza o armazenamento local para persistir o estado de follow
    authStore.updateLocalStorageUser()
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || ''
    

    // Trata o caso idempotente em que o usuário já segue o perfil
    if (typeof msg === 'string' && msg.includes('Already following')) {
      
      const updatedAuthUser = await authStore.fetchMe()
      if (profile.value?.id === targetUserId) {
        const refreshedProfile = await userStore.fetchUserById(targetUserId)
        profile.value = refreshedProfile
      }
      return
    }

    // Erro inesperado; ignora para que a interface consiga se recuperar
  }
}

const isToggledClass = computed(() => (statsModal.value.isToggled ? 'lights-off' : ''))

const messageProfile = () => {
  if (!displayedProfile.value?.id || !displayedProfile.value?.userName) {
    return
  }

  router.push({
    name: 'direct',
    query: {
      userId: displayedProfile.value.id,
      username: displayedProfile.value.userName
    }
  })
}

const handleStatsItemAction = async (item: any) => {
  if (!authStore.token || !statsModal.value.type || !profile.value) {
    return
  }

  const isFollowingList = statsModal.value.type === 'Following'
  const isFollowersList = statsModal.value.type === 'Followers'

  if (isFollowingList) {
    try {
      await api.delete(`/users/${item.id}/follow`)
      profile.value.following = profile.value.following?.filter((user) => user.id !== item.id) ?? []
      profile.value.followingCount = Math.max(0, profile.value.followingCount - 1)
      if (authStore.user?.following) {
        authStore.user.following = authStore.user.following.filter((user) => user.id !== item.id)
        authStore.user.followingCount = Math.max(0, authStore.user.followingCount - 1)
      }
      statsModal.value.stats = statsModal.value.stats.filter((user: any) => user.id !== item.id)
    } catch {
      // ignora falhas por enquanto
    }
  } else if (isFollowersList && profile.value.id === authStore.user?.id) {
    profile.value.followers = profile.value.followers?.filter((user) => user.id !== item.id) ?? []
    profile.value.followerCount = Math.max(0, profile.value.followerCount - 1)
    statsModal.value.stats = statsModal.value.stats.filter((user: any) => user.id !== item.id)
  }
}

const loadUserInfo = async (username?: string) => {
  profile.value = null
  postStore.posts = []

  const cleanedUsername = username ? username.toString().trim() : undefined
  const isUsernameRouteValid = Boolean(cleanedUsername) && cleanedUsername !== 'undefined'

  // Garante que os dados do usuário autenticado estejam atualizados
  if (authStore.token) {
    try {
      await authStore.fetchMe()
      authStore.updateLocalStorageUser()
    } catch (_) {
      // usa o usuário em cache caso a busca falhe
    }
  }

  // Carrega o perfil alvo quando o username foi informado
  if (isUsernameRouteValid && cleanedUsername) {
    const user = await userStore.fetchProfileByUsername(cleanedUsername)
    profile.value = user ?? (authStore.user?.userName === cleanedUsername ? authStore.user : null)
  } else if (authStore.user) {
    profile.value = authStore.user
  } else if (authStore.token) {
    try {
      profile.value = await authStore.fetchMe()
    } catch {
      profile.value = null
    }
  }

  

  if (profile.value) {
    
    const profileUsername = isUsernameRouteValid && cleanedUsername
      ? cleanedUsername
      : profile.value.userName

    if (profileUsername) {
      postStore.posts = []
      await postStore.fetchByUsername(profileUsername).catch((error) => {
        console.warn('loadUserInfo: failed to fetch posts', error)
      })
    } else {
      await postStore.fetchFeed().catch((error) => {
        console.warn('loadUserInfo: failed to fetch feed', error)
      })
    }
  } else if (!authStore.token) {
    router.push({ name: 'login' })
  } else {
    router.push({ name: 'NotFound' })
  }
}

watch(
  () => route.params.username,
  async (username) => {
    await loadUserInfo(username as string | undefined)
  }
)

watch(
  () => activeTab.value,
  async (newTab) => {
    if (newTab === ProfileTab.Saved && isOwnProfile.value) {
      try {
        await postStore.fetchSavedPosts()
      } catch (error) {
        console.warn('Failed to load saved posts:', error)
      }
    } else if (newTab === ProfileTab.Posts && isOwnProfile.value) {
      // Garante que os posts do usuário sejam carregados ao retornar à aba de posts
      if (postStore.posts.length === 0 || !postStore.posts.some(p => p.userName === displayedProfile.value?.userName)) {
        try {
          const profileUsername = displayedProfile.value?.userName
          if (profileUsername) {
            await postStore.fetchByUsername(profileUsername)
          }
        } catch (error) {
          console.warn('Failed to reload user posts:', error)
        }
      }
    }
  }
)

onMounted(async () => {
  await loadUserInfo(route.params.username as string | undefined)
})
</script>