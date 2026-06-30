<template>
  <Transition name="modal-fade">
    <div v-show="isToggled" v-if="isToggled" class="fixed inset-0 z-40 flex items-center justify-center">
      <!-- Desktop Modal Header -->
      <div class="hidden md:block fixed inset-x-0 top-5 right-0 z-50">
        <div class="md:mr-12 flex items-center justify-between cursor-pointer">
          <span class="ml-auto inline-flex text-white hover:text-gray-400 transition">
            <SVGLoader :icon="'cross'" @click="onModalClosed()" />
          </span>
        </div>
      </div>

      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/80" @click="onModalClosed()" />

      <!-- Modal Content -->
      <div
        class="relative z-50 w-full md:max-w-4xl mx-auto rounded-lg overflow-hidden"
        :class="{ 'h-screen md:h-auto': isToggled }">
        
        <!-- Mobile Header -->
        <div class="md:hidden flex justify-between items-center bg-black border-b border-gray-700 p-3">
          <span class="rotate-270 cursor-pointer" @click="onModalClosed()">
            <SVGLoader :icon="'back-arrow'" />
          </span>
          <span class="font-sans text-md font-semibold text-white">Post</span>
          <span class="invisible">
            <SVGLoader :icon="'share'" />
          </span>
        </div>

        <!-- Modal Body -->
        <div class="bg-black overflow-y-auto max-h-[90vh] md:max-h-screen">
          <div v-if="isLoading" class="flex items-center justify-center py-20 text-white">
            <span>Loading post...</span>
          </div>
          <div v-else-if="error" class="flex items-center justify-center py-20 text-red-400">
            <span>{{ error }}</span>
          </div>
          <div v-else-if="activePost" class="flex flex-col md:flex-row">
            <div class="bg-black md:basis-7/12">
              <MediaCarousel
                :style="'rounded-none'"
                :medias="resolvePostMediaList(activePost)"
              />
              
            </div>

            <div class="md:basis-5/12 flex flex-col bg-slate-950">
              <div class="flex-1 overflow-y-auto p-4 md:p-5">
                <div class="flex items-center justify-between pb-4 border-b border-gray-700">
                  <div class="flex items-center gap-3">
                    <ProfileAvatar :src="activePost.profilePictureUrl" :size="40" />
                    <div class="flex flex-col gap-0.5">
                      <span class="font-sans text-sm font-semibold text-white">
                        {{ activePost.userName }}
                      </span>
                      <span class="font-sans text-xs text-gray-400">
                        {{ formatDate(activePost.createdAt) }}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="text-white hover:text-gray-300 transition"
                    @click="openPostOptions"
                  >
                    <SVGLoader :icon="'more-options'" />
                  </button>
                </div>

                <div class="flex items-center justify-between py-4 gap-6">
                  <div class="flex items-center gap-6">
                    <button
                      type="button"
                      class="text-white hover:text-gray-300 transition"
                      @click="onPostLiked"
                    >
                      <SVGLoader :icon="activePost.hasLiked ? 'unlike' : 'like'" />
                    </button>
                    <button
                      type="button"
                      :class="[{ 'cursor-not-allowed opacity-50': activePost.disableComments }, 'text-white hover:text-gray-300 transition']"
                      @click="activePost.disableComments ? toast.info('Comments are disabled for this post') : focusTextArea()"
                    >
                      <SVGLoader :icon="'comment'" />
                    </button>
                    <button
                      type="button"
                      class="text-white hover:text-gray-300 transition"
                      @click="onSharePost"
                    >
                      <SVGLoader :icon="'share'" />
                    </button>
                  </div>
                  <button
                    type="button"
                    class="text-white hover:text-gray-300 transition"
                    @click="onSavePost"
                  >
                    <SVGLoader :icon="activePost.isSaved ? 'save-filled' : 'save'" />
                  </button>
                </div>

                <div class="pb-4 border-b border-gray-700">
                  <div class="font-sans text-sm font-semibold text-white">
                    {{ activePost.hideLikes ? 'Likes hidden' : `${activePost.likeCount ?? 0} Likes` }}
                  </div>
                </div>

                <div class="py-4 border-b border-gray-700">
                  <div class="text-white text-sm leading-6">
                    <span class="font-semibold">{{ activePost.userName }}</span> {{ activePost.caption }}
                  </div>
                </div>

                <div class="py-3 border-b border-gray-700">
                  <button v-if="activePost.commentCount && activePost.commentCount > 0" class="text-sm text-gray-400 hover:text-white transition">
                    View all {{ activePost.commentCount }} comments
                  </button>
                </div>

                <div class="space-y-3 py-4">
                  <div v-if="activePost.comments && activePost.comments.length > 0">
                    <CommentCard
                      v-for="comment in activePost.comments"
                      :key="comment.id"
                      :comment="comment"
                      @on-comment-like="onCommentLike"
                      @on-delete-comment="onDeleteComment"
                      @on-reply-submit="onReplySubmit"
                    />
                  </div>
                </div>
              </div>

              <div class="border-t border-gray-700 px-4 py-3">
                <template v-if="!activePost.disableComments">
                  <form class="flex items-center gap-3" @submit.prevent="onAddComment">
                    <ProfileAvatar :src="authStore.user?.profilePictureUrl" :size="32" />
                    <span class="relative">
                      <EmojiPickerModal @select-emoji="appendEmoji" />
                    </span>
                    <input
                      ref="commentInputRef"
                      v-model="commentText"
                      type="text"
                      class="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                      placeholder="Add a comment..."
                    />
                    <button
                      type="submit"
                      class="text-red-500 hover:text-red-400 font-semibold transition text-sm"
                    >
                      Post
                    </button>
                  </form>
                </template>
                <template v-else>
                  <div class="text-sm text-gray-400">Comments are disabled for this post.</div>
                </template>
              </div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center py-20 text-white">
            <span>Post not found</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import SVGLoader from '../basics/SVGLoader.vue'
import MediaCarousel from '../carousels/MediaCarousel.vue'
import EmojiPickerModal from './EmojiPickerModal.vue'
import ProfileAvatar from '../basics/ProfileAvatar.vue'
import CommentCard from '../cards/CommentCard.vue'
import { usePostStore, useAuthStore, useModalManagerStore } from '@/stores'
import { ModalName, resolvePostMediaList, type PostCard as PostCardType, type PostComment } from '@/common'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

interface Props {
  isToggled: boolean
  post?: PostCardType | null
}

const props = withDefaults(defineProps<Props>(), {
  post: null,
  isToggled: false
})

const emit = defineEmits<{
  'on-modal-closed': []
  'on-post-liked': [postId: string]
  'on-add-comment': [commentText: string]
  'on-delete-comment': [commentId: string]
  'on-comment-liked': [commentId: string]
  'on-reply-submit': [{ commentId: string; content: string }]
}>()

const postStore = usePostStore()
const authStore = useAuthStore()
const modalStoreManager = useModalManagerStore()
const toast = useToast()
const router = useRouter()

const isLoading = computed(() => postStore.isLoading)
const error = computed(() => postStore.error)
const activePost = computed(() => props.post)
const commentText = ref('')
const commentInputRef = ref<HTMLInputElement | null>(null)
const replyingCommentId = ref<string | null>(null)
const replyText = ref('')
const replyInputRef = ref<HTMLTextAreaElement | null>(null)
const currentUserName = computed(() => authStore.user?.userName ?? '')

/** Append emoji to comment text and keep focus on input */
const appendEmoji = (emoji: any) => {
  commentText.value += emoji.i
  // restaura o foco no input
  setTimeout(() => commentInputRef.value?.focus(), 0)
}

const onAddComment = () => {
  const content = commentText.value.trim()
  if (!content || !activePost.value?.id) return
  emit('on-add-comment', content)
  commentText.value = ''
}

const onDeleteComment = (commentId: string) => {
  if (!activePost.value?.id) return
  emit('on-delete-comment', commentId)
}

const onCommentLike = (commentId: string) => {
  emit('on-comment-liked', commentId)
}

const onReplySubmit = (replyData: { commentId: string; content: string }) => {
  emit('on-reply-submit', replyData)
}

const onReplyClick = (commentId: string) => {
  replyingCommentId.value = commentId
  replyText.value = ''
  nextTick(() => replyInputRef.value?.focus())
}

const onCancelReply = () => {
  replyingCommentId.value = null
  replyText.value = ''
}

const onSubmitReply = () => {
  if (!replyText.value.trim() || !activePost.value?.id || !replyingCommentId.value) return
  emit('on-reply-submit', {
    commentId: replyingCommentId.value,
    content: replyText.value.trim()
  })
  replyText.value = ''
  replyingCommentId.value = null
}

const formatDate = (date: string | number | undefined) => {
  if (!date) return ''
  return new Date(typeof date === 'string' ? date : date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const onModalClosed = () => {
  emit('on-modal-closed')
}

const onEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    onModalClosed()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onEscapeKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onEscapeKey)
})

const focusTextArea = () => {
  commentInputRef.value?.focus()
}

const openPostOptions = () => {
  if (!activePost.value?.id) return
  modalStoreManager.setActivePost(activePost.value)
  modalStoreManager.openModal(ModalName.POST_OPTIONS)
}

const onPostLiked = async () => {
  if (!activePost.value?.id) return
  emit('on-post-liked', activePost.value.id)
}

const onSavePost = async () => {
  if (!activePost.value?.id) return
  try {
    if (activePost.value.isSaved) {
      await postStore.unsavePost(activePost.value.id)
      toast.success('Post removed from saved')
    } else {
      await postStore.savePost(activePost.value.id)
      toast.success('Post saved')
    }
  } catch (error) {
    toast.error(postStore.error ?? 'Unable to save post')
  }
}

const onSharePost = async () => {
  if (!activePost.value?.id) {
    toast.error('Unable to share post')
    return
  }

  const frontendUrl = `${window.location.origin}${router.resolve({ name: 'post', params: { id: activePost.value.id } }).href}`
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? window.location.origin
  const shareUrl = `${apiBase.replace(/\/$/, '')}/posts/share/${activePost.value.id}`

  try {
    const mediaUrl = activePost.value?.mediaUrl ?? activePost.value?.carouselMedia?.[0]?.mediaUrl ?? activePost.value?.imageUrl

    // tenta compartilhar o arquivo de mídia real quando o navegador suportar
    if (mediaUrl && typeof fetch === 'function' && typeof navigator !== 'undefined' && typeof (navigator as any).canShare === 'function') {
      try {
        const resp = await fetch(mediaUrl)
        if (resp && resp.ok) {
          const blob = await resp.blob()
          if (blob && blob.size > 0) {
            const ext = (blob.type || '').split('/').pop() ?? 'bin'
            const file = new File([blob], `visiongram-media.${ext}`, { type: blob.type || undefined })
            const canShareFiles = (navigator as any).canShare && (navigator as any).canShare({ files: [file] })
            if (canShareFiles) {
              await (navigator as any).share({
                files: [file],
                title: 'VisionGram',
                text: `${activePost.value.userName}: ${activePost.value.caption ?? ''}\nOpen: ${frontendUrl}`
              })
              toast.success('Shared successfully')
              return
            }
          }
        }
      } catch (e) {
        // volta para o compartilhamento por URL quando a tentativa de arquivo falhar
      }
    }

    // fallback: compartilha a URL do backend com OG tags ou copia para a área de transferência
    if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
      await (navigator as any).share({
        title: 'VisionGram',
        text: `${activePost.value.userName}: ${activePost.value.caption ?? ''}`,
        url: shareUrl
      })
      toast.success('Shared successfully')
    } else if (navigator && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard')
    } else {
      toast.error('Share not supported')
    }
  } catch (err: any) {
    const cancelled = err && typeof err === 'object' && 'name' in err && (err as any).name === 'AbortError'
    if (!cancelled) {
      toast.error('Unable to share post')
    }
  }
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.rotate-270 {
  transform: rotate(270deg);
}
</style>
