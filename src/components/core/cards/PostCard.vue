<template>
  <div class="flex flex-col overflow-hidden rounded-3xl border border-[#262626] bg-[#121212] p-3 sm:p-4">
    <div class="flex items-center justify-between gap-2 px-1 pb-3">
      <!-- 1: username | daysSinceUpload | options -->
      <div class="flex space-x-2" @click="goToUserProfile(post.userName)">
          <div class="story-avatar">
            <a href="#" class="block bg-white rounded-full relative">
              <ProfileAvatar :src="post.profilePictureUrl" :size="32" class="p-0.5 bg-black" />
            </a>
          </div>

        <div class="flex pt-1">
          <div class="cursor-pointer font-sans text-sm font-semibold text-white self-center">{{ post.userName }}</div>

          <div class="text-gray-500 w-5 font-sans text-md font-semibold self-center px-2">•</div>

          <div class="font-sans text-sm font-light text-[#949494] self-center">{{ post.createdAt }}</div>
        </div>
      </div>

      <div class="cursor-pointer self-end relative">
        <button type="button" class="inline-flex items-center" @click="openPostOptions(post)">
          <SVGLoader :icon="'more-options'" />
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <div class="cursor-pointer overflow-hidden rounded-2xl bg-black" @click="openPost(post)">
        <MediaCarousel :medias="resolvedCarouselMedia" />
      </div>

      <div class="flex items-center justify-between px-1">
        <div class="flex items-center gap-3">
          <span class="cursor-pointer hover:scale-90" @click="onPostLike(post)">
            <SVGLoader v-if="post.hasLiked" :icon="'like'" />
            <SVGLoader v-else :icon="'unlike'" />
          </span>

          <span
            :class="[{ 'cursor-not-allowed opacity-50': post.disableComments }, 'hover:scale-90']"
            @click="post.disableComments ? toast.info('Comentários estão desativados para esta publicação') : onOpenCommentModal(post)"
          >
            <SVGLoader :icon="'comment'" />
          </span>

          <span class="cursor-pointer hover:scale-90" @click="onSharePost(post)">
            <SVGLoader :icon="'share'" />
          </span>
        </div>

        <div class="cursor-pointer hover:scale-90" @click="onSavePost(post)">
          <SVGLoader :icon="post.isSaved ? 'save-filled' : 'save'" />
        </div>
      </div>

      <!-- 4: Likes -->
      <div class="cursor-pointer font-sans text-sm font-semibold text-white self-start">
        {{ post.hideLikes ? 'Curtidas ocultas' : findNumberOfLikes }}
      </div>

      <!-- 5: Caption -->
      <div class="font-sans text-sm text-white flex-col">
        <p class="text-sm text-left indent-8 break-all ">{{ post.caption }}</p>
        <p v-if="post.commentCount > 0" class="text-md text-left hidden sm:block text-gray-400 cursor-pointer" @click="openPost(post)">
          Ver todos os {{ post.commentCount }} comentários
        </p>
      </div>

      <!-- 6: Comment Form -->
      <div v-if="isCommentAreaVisible && !post.disableComments" class="flex border-b border-slate-800 justify-between  ">
        <span class="basis-4/5">
          <textarea v-model="comment" rows="1" class="outline-none resize-none border-none text-white block w-full text-sm bg-black placeholder:text-gray-1100" placeholder="Adicione um comentário..." @keypress.enter.prevent="onPostComment"></textarea>
        </span>

        <span v-show="comment.length > 0" class="font-sans text-md text-sky-500 cursor-pointer hover:text-white h-6" @click="onPostComment">Publicar</span>

        <span class="relative cursor-pointer">
          <EmojiPickerModal @select-emoji="appendEmoji" />
        </span>
      </div>
      <div v-else-if="post.disableComments" class="border-b border-slate-800 py-3 text-sm text-gray-400">
        Comentários estão desativados para esta publicação.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import SVGLoader from '../basics/SVGLoader.vue'
import EmojiPickerModal from '../modals/EmojiPickerModal.vue'
import MediaCarousel from '../carousels/MediaCarousel.vue'
import ProfileAvatar from '../basics/ProfileAvatar.vue'
import { resolvePostMediaList, type PostCard, type Emoji, ModalName } from '@/common'
import { useModalManagerStore, useAuthStore, usePostStore } from '@/stores'
import { useToast } from 'vue-toastification'
import router from '@/router'

const props = defineProps({
  post: { type: Object as () => PostCard, required: true },
  isCommentAreaVisible: { type: Boolean, default: true }
})

const emit = defineEmits(['onOpenCommentModal', 'onPostLike', 'onPostComment', 'onPostSave'])

const comment = ref('')

// Stores
const modalStoreManager = useModalManagerStore()
const authStore = useAuthStore()
const postStore = usePostStore()
const toast = useToast()
const route = useRoute()

const showOptions = ref(false)
const isPostOwner = (authStore.user?.userName === props.post.userName)

const toggleOptions = () => {
  showOptions.value = !showOptions.value
}

const openPostOptions = (post: PostCard) => {
  showOptions.value = false
  modalStoreManager.setActivePost(post)
  modalStoreManager.openModal(ModalName.POST_OPTIONS)
}

const confirmDelete = async (post: PostCard) => {
  const ok = window.confirm('Tem certeza de que deseja excluir esta publicação?')
  if (!ok) return

  try {
    if (!post.id) {
      toast.error('ID da publicação inválido')
      return
    }
    await postStore.deletePost(post.id)
    toast.success('Publicação excluída')
    modalStoreManager.closeModal()
    modalStoreManager.clearActivePost()
  } catch {
    toast.error(postStore.error ?? 'Não foi possível excluir a publicação')
  }
}

// Computed
const findNumberOfLikes = computed(() => (props.post.likeCount >= 1 ? `${props.post.likeCount} curtidas` : 'Seja o primeiro a curtir isso'))
const resolvedCarouselMedia = computed(() => resolvePostMediaList(props.post))

const openPost = (post: PostCard) => {
  if (!post.id) return
  router.push({
    name: 'post',
    params: { id: post.id },
    query: { from: route.fullPath }
  })
}

const onOpenCommentModal = (post: PostCard) => {
  if (!post.id) return
  // Navega para a rota da publicação, que abrirá o modal
  router.push({
    name: 'post',
    params: { id: post.id },
    query: { from: route.fullPath }
  })
}

const onPostComment = () => {
  const value = comment.value.trim()
  if (!value) return
  emit('onPostComment', value, props.post.id)
  comment.value = ''
}

const onPostLike = (post: PostCard) => {
  if (!post.id) return
  emit('onPostLike', post.id)
}

const onSharePost = async (post: PostCard) => {
  if (!post.id) {
    toast.error('Não foi possível compartilhar esta publicação.')
    return
  }

  const resolved = router.resolve({ name: 'post', params: { id: post.id } })
  const frontendUrl = `${window.location.origin}${resolved.href}`
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? window.location.origin
  const shareUrl = `${apiBase.replace(/\/$/, '')}/posts/share/${post.id}`
  const mediaUrl = post.mediaUrl ?? post.carouselMedia?.[0]?.mediaUrl ?? post.imageUrl

  try {
    if (mediaUrl && typeof fetch === 'function' && typeof navigator !== 'undefined' && typeof (navigator as any).canShare === 'function') {
      try {
        const response = await fetch(mediaUrl)
        const blob = await response.blob()

        if (blob && blob.size > 0) {
          const ext = (blob.type || '').split('/').pop() ?? 'bin'
          const file = new File([blob], `visiongram-media.${ext}`, { type: blob.type || undefined })
          const canShareFiles = (navigator as any).canShare({ files: [file] })

          if (canShareFiles) {
            await (navigator as any).share({
              files: [file],
              title: `${post.userName}'s post`,
              text: `${post.userName}: ${post.caption ?? ''}
Open: ${frontendUrl}`
            })
            toast.success('Compartilhado com sucesso')
            router.push({
              name: 'post',
              params: { id: post.id },
              query: { from: route.fullPath }
            })
            return
          }
        }
      } catch {
        // volta para o compartilhamento por link quando o compartilhamento de arquivos falhar
      }
    }

    if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
      await (navigator as any).share({
        title: `${post.userName}'s post`,
        text: `${post.userName}: ${post.caption ?? ''}
Open: ${frontendUrl}`,
        url: shareUrl
      })
      toast.success('Compartilhado com sucesso')
    } else if (navigator && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copiado para a área de transferência')
    } else {
      toast.error('Compartilhamento não suportado')
    }
  } catch (error: any) {
    const cancelled = error && typeof error === 'object' && 'name' in error && (error as any).name === 'AbortError'
    if (!cancelled) {
      toast.error('Não foi possível compartilhar o link da publicação')
    }
  }

  router.push({
    name: 'post',
    params: { id: post.id },
    query: { from: route.fullPath }
  })
}

const appendEmoji = (emoji: Emoji) => { comment.value += emoji.i }

const onSavePost = async (post: PostCard) => {
  if (!post.id) return
  try {
    const existing = postStore.posts.find((p) => p.id === post.id)
    if (existing?.isSaved) {
      await postStore.unsavePost(post.id)
    } else {
      await postStore.savePost(post.id)
    }
  } catch (error: any) {
    toast.error(postStore.error ?? 'Não foi possível atualizar o estado salvo')
  }
  // still emit for backwards compatibility
  emit('onPostSave', post.id)
}

const goToUserProfile = (userName: string) => { router.push({ name: 'profile', params: { username: userName } }) }

onMounted(() => {})
onUnmounted(() => {})
</script>
