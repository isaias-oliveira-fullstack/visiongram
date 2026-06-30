<template>
  <Transition>
    <div v-show="props.isToggled">
      <div
        :class="props.isToggled ? 'md:block' : ''"
        class="hidden fixed inset-x-0 top-5 right-0"
      >
        <div class="md:mr-12 flex items-center justify-between cursor-pointer">
          <span class="ml-auto inline-flex text-white">
            <SVGLoader :icon="'cross'" @click="onModalClosed" />
          </span>
        </div>
      </div>

      <div
        class="w-full z-50 fixed h-screen md:h-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        :class="{
          hidden: !props.isToggled,
          'max-w-xs': props.modalSize === ModalSize.SuperSmall,
          'max-w-sm': props.modalSize === ModalSize.ExtraSmall,
          'max-w-md': props.modalSize === ModalSize.Small,
          'max-w-lg': props.modalSize === ModalSize.Medium,
          'max-w-4xl': props.modalSize === ModalSize.Large,
          'max-w-7xl': props.modalSize === ModalSize.ExtraLarge
        }"
      >
        <div class="md:hidden block">
          <div class="flex justify-between cursor-pointer bg-black w-full p-3 border-b border-gray-700">
            <span class="rotate-270" @click="onModalClosed">
              <SVGLoader :icon="'back-arrow'" />
            </span>
            <span class="font-sans text-md font-semibold text-white">Comentários</span>
            <span>
              <SVGLoader :icon="'share'" />
            </span>
          </div>
        </div>

        <div
          v-if="activePost"
          class="container mx-auto z-50 block w-full overflow-x-hidden overflow-y-auto md:inset-0"
        >
          <div class="relative bg-black flex md:flex-row flex-col">
            <div class="md:p-0 md:block p-2 w-full hidden">
              <MediaCarousel :style="'rounded-none'" :medias="resolvePostMediaList(activePost)" />
            </div>

            <div class="flex flex-col sm:space-y-4 lg:basis-7/12 sm:basis-10/12 z-50 sm:border-l border-slate-800 sm:p-2">
              <div class="flex flex-col sm:space-x-1 justify-between sm:p-2">
                <div class="sm:block hidden">
                  <div class="flex justify-between border-b border-slate-800 p-3">
                    <div class="flex space-x-2">
                      <div class="story-avatar">
                        <a href="#" class="block bg-white rounded-full relative">
                          <ProfileAvatar :src="activePost.profilePictureUrl" :size="32" class="p-0.5 bg-black" />
                        </a>
                      </div>
                      <div class="flex pt-1">
                        <div class="cursor-pointer font-sans text-sm font-semibold text-white self-center">
                          {{ activePost.userName }}
                        </div>
                        <div class="text-gray-500 w-5 font-sans text-md font-semibold self-center px-2">•</div>
                        <div class="font-sans text-sm font-light text-[#949494] self-center">
                          {{ activePost.createdAt }}
                        </div>
                      </div>
                    </div>
                    <div class="cursor-pointer">
                      <SVGLoader :icon="'comment-options'" />
                    </div>
                  </div>
                </div>

                <div class="block sm:hidden">
                  <div class="flex justify-between border-b border-t border-slate-700 bg-slate-1100 p-2.5 space-x-4">
                    <div class="flex">
                      <ProfileAvatar :src="activePost.profilePictureUrl" :size="40" class="shadow-lg" />
                    </div>
                    <div class="flex w-full relative">
                      <input
                        v-model="commentForm"
                        type="text"
                        class="bg-black border border-slate-800 text-white text-sm rounded-full w-full p-3"
                        placeholder="Adicione um comentário..."
                        @keypress.enter.prevent="onAddComment"
                      />
                      <button
                        type="button"
                        :class="commentForm ? 'text-sky-500 sm:cursor-pointer' : 'text-white'
                          + ' absolute inset-y-0 right-5 flex items-center pl-3 font-semibold'"
                        class="transition"
                        @click="onAddComment"
                      >
                        Publicar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="lg:max-h-150 sm:max-h-52.75 h-screen sm:p-1 space-y-7 overflow-y-auto scrollbar scrollbar-none">
                <CommentCard
                  v-for="(comment, index) of activePost.comments"
                  v-if="activePost.comments && activePost.comments.length >= 1"
                  :id="index === activePost.comments.length - 1 ? 'last-comment' : ''"
                  :key="comment.id"
                  :comment="comment"
                  @on-comment-like="onCommentLiked"
                  @on-delete-comment="onDeleteComment"
                  @on-reply-submit="onReplySubmit"
                />
                <div v-else class="flex flex-col space-y-2">
                  <span class="font-sans lg:text-2xl md:text-md text-white font-bold self-center">
                    Ainda não há comentários.
                  </span>
                  <span class="font-sans text-sm text-white font-normal self-center">
                    Comece a conversa.
                  </span>
                </div>
              </div>

              <div class="sm:block hidden">
                <div class="flex justify-between p-2 border-t border-slate-800">
                  <div class="flex space-x-4">
                    <span class="cursor-pointer hover:scale-90" @click="onPostLike(activePost)">
                      <SVGLoader :icon="activePost.hasLiked ? 'like' : 'unlike'" />
                    </span>
                    <span class="cursor-pointer hover:scale-90" @click="focusTextArea">
                      <SVGLoader :icon="'comment'" />
                    </span>
                    <span class="cursor-pointer hover:scale-90">
                      <SVGLoader :icon="'share'" />
                    </span>
                  </div>
                  <div class="cursor-pointer hover:scale-90" @click="onSavePost">
                    <SVGLoader :icon="'save'" />
                  </div>
                </div>
              </div>

              <div class="sm:block hidden">
                <div class="flex flex-col space-y-2 space-x-2">
                  <span class="pl-2 cursor-pointer font-sans text-sm font-semibold text-white self-start">
                    {{ numberOfLikes }}
                  </span>
                  <span class="cursor-pointer font-sans text-gray-600 text-xs self-start">
                    {{ activePost.createdAt }}
                  </span>
                </div>
              </div>

              <div class="sm:block hidden">
                <div class="flex justify-between border-t border-slate-800 p-2 pb-0">
                  <span class="hover:cursor-pointer self-center relative">
                    <EmojiPickerModal @select-emoji="appendEmoji" />
                  </span>
                  <textarea
                    ref="commentFormElementRef"
                    v-model="commentForm"
                    rows="1"
                    class="focus:outline-none resize-none placeholder:text-gray-1100 block w-full text-md bg-black text-white border-none mx-5"
                    placeholder="Adicione um comentário..."
                    @keypress.enter.prevent="onAddComment"
                  ></textarea>
                  <span
                    :class="commentForm ? 'text-sky-500 sm:cursor-pointer' : 'text-white'"
                    class="font-sans text-md text-white justify-self-end mb-2 cursor-default"
                    @click="onAddComment"
                  >
                    Publicar
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, type PropType } from 'vue'
import SVGLoader from '../basics/SVGLoader.vue'
import CommentCard from '../cards/CommentCard.vue'
import MediaCarousel from '../carousels/MediaCarousel.vue'
import EmojiPickerModal from './EmojiPickerModal.vue'
import ProfileAvatar from '../basics/ProfileAvatar.vue'
import { ModalSize, resolvePostMediaList, type Emoji, type PostCard, type PostCommentCard } from '@/common'
import { useModalManagerStore, usePostStore } from '@/stores'
import { useToast } from 'vue-toastification'

const props = defineProps({
  isToggled: {
    type: Boolean,
    required: true
  },
  modalSize: {
    type: String as PropType<ModalSize>,
    default: ModalSize.ExtraLarge
  }
})

const emit = defineEmits<{
  'onAddComment': [string]
  'onDeleteComment': [string]
  'onModalClosed': []
  'onCommentLiked': [string]
  'onPostLiked': [string]
  'onReplySubmit': [{ commentId: string; content: string }]
}>()

const modalManagerStore = useModalManagerStore()
const postStore = usePostStore()
const toast = useToast()
const activePost = ref<PostCard | undefined>(undefined)
const commentForm = ref('')
const commentFormElementRef = ref<HTMLTextAreaElement | null>(null)

const numberOfLikes = computed(() => {
  if (!activePost.value) return ''
  return activePost.value.likeCount >= 1
    ? `${activePost.value.likeCount} curtidas`
    : 'Seja o primeiro a curtir isso'
})

const appendEmoji = (emoji: Emoji) => {
  commentForm.value += emoji.i
}

const focusTextArea = () => {
  commentFormElementRef.value?.focus()
}

const resetCommentValue = () => {
  commentForm.value = ''
}

const onAddComment = () => {
  if (!commentForm.value) return
  emit('onAddComment', commentForm.value)
  resetCommentValue()
  scrollToTheLatestComment()
}

const onModalClosed = () => {
  emit('onModalClosed')
  closeCommentModal()
  clearActivePost()
}

const onCommentLiked = (commentId: PostCommentCard['id']) => {
  emit('onCommentLiked', commentId)
}

const onDeleteComment = (commentId: string) => {
  emit('onDeleteComment', commentId)
}

const onPostLike = (post: PostCard | undefined) => {
  if (!post?.id) return
  emit('onPostLiked', post.id)
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

const closeCommentModal = () => {
  modalManagerStore.modalName = null
}

const clearActivePost = () => {
  modalManagerStore.clearActivePost()
}

const scrollToTheLatestComment = () => {
  const target = document.querySelector('#last-comment')
  if (target) target.scrollIntoView({ behavior: 'smooth' })
}

const onReplySubmit = (replyData: { commentId: string; content: string }) => {
  emit('onReplySubmit', replyData)
}

watch(
  () => modalManagerStore.getActivePost,
  (newPost) => {
    activePost.value = newPost
    console.debug('[CommentModal] activePost changed', { id: newPost?.id, carouselMediaLength: newPost?.carouselMedia?.length, imageUrl: newPost?.imageUrl, mediaUrl: newPost?.mediaUrl })
  },
  { immediate: true }
)
</script>