<template>
  <Transition name="modal-fade">
    <div v-if="isToggled" class="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div class="absolute inset-0 bg-black/70" @click="onClose" />

      <div class="relative w-full max-w-md rounded-t-3xl md:rounded-3xl bg-slate-950 border border-gray-800 p-5 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-white">Opções da publicação</h3>
            <p class="text-xs text-gray-400">Gerencie esta publicação</p>
          </div>
          <button type="button" class="text-gray-300 hover:text-white" @click="onClose">
            <SVGLoader icon="cross" />
          </button>
        </div>

        <div v-if="!post" class="py-8 text-center text-sm text-gray-400">
          Nenhuma publicação selecionada.
        </div>

        <div v-else class="space-y-4">
          <div class="flex items-center gap-3">
            <ProfileAvatar :src="post.profilePictureUrl" :size="40" />
            <div>
              <p class="font-semibold text-white">{{ post.userName }}</p>
              <p class="text-xs text-gray-500">{{ post.createdAt }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <button
              v-if="isPostOwner"
              type="button"
              class="w-full rounded-2xl border border-gray-700 bg-black px-4 py-3 text-left text-sm font-medium text-white hover:bg-slate-900"
              @click="onEditPost"
            >
              Editar publicação
            </button>

            <button
              v-if="isPostOwner"
              type="button"
              class="w-full rounded-2xl border border-gray-700 bg-black px-4 py-3 text-left text-sm font-medium text-white hover:bg-slate-900 flex items-center justify-between"
              @click="toggleHideLikes"
            >
              <span>{{ settings.hideLikes ? 'Mostrar contagem de curtidas' : 'Ocultar contagem de curtidas' }}</span>
              <span class="inline-flex h-5 w-9 items-center rounded-full bg-gray-700 p-1">
                <span
                  class="h-3 w-3 rounded-full bg-white transition"
                  :class="{ 'translate-x-4': settings.hideLikes, 'translate-x-0': !settings.hideLikes }"
                />
              </span>
            </button>

            <button
              v-if="isPostOwner"
              type="button"
              class="w-full rounded-2xl border border-gray-700 bg-black px-4 py-3 text-left text-sm font-medium text-white hover:bg-slate-900 flex items-center justify-between"
              @click="toggleDisableComments"
            >
              <span>{{ settings.disableComments ? 'Ativar comentários' : 'Desativar comentários' }}</span>
              <span class="inline-flex h-5 w-9 items-center rounded-full bg-gray-700 p-1">
                <span
                  class="h-3 w-3 rounded-full bg-white transition"
                  :class="{ 'translate-x-4': settings.disableComments, 'translate-x-0': !settings.disableComments }"
                />
              </span>
            </button>

            <button
              type="button"
              class="w-full rounded-2xl border border-gray-700 bg-black px-4 py-3 text-left text-sm font-medium text-white hover:bg-slate-900"
              @click="goToPost"
            >
              Ir para a publicação
            </button>

            <button
              type="button"
              class="w-full rounded-2xl border border-gray-700 bg-black px-4 py-3 text-left text-sm font-medium text-white hover:bg-slate-900"
              @click="sharePost"
            >
              Compartilhar publicação
            </button>

            <button
              type="button"
              class="w-full rounded-2xl border border-gray-700 bg-black px-4 py-3 text-left text-sm font-medium text-white hover:bg-slate-900"
              @click="copyLink"
            >
              Copiar link
            </button>

            <button
              type="button"
              class="w-full rounded-2xl border border-gray-700 bg-black px-4 py-3 text-left text-sm font-medium text-white hover:bg-slate-900"
              @click="embedPost"
            >
              Incorporar
            </button>

            <button
              type="button"
              class="w-full rounded-2xl border border-gray-700 bg-black px-4 py-3 text-left text-sm font-medium text-white hover:bg-slate-900"
              @click="viewProfile"
            >
              Sobre esta conta
            </button>

            <button
              v-if="isPostOwner"
              type="button"
              class="w-full rounded-2xl border border-red-700 bg-black px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-red-950"
              @click="confirmDelete"
            >
              Excluir publicação
            </button>

            <button
              type="button"
              class="w-full rounded-2xl border border-gray-700 bg-slate-900 px-4 py-3 text-left text-sm font-medium text-gray-300 hover:bg-gray-800"
              @click="onClose"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import ProfileAvatar from '../basics/ProfileAvatar.vue'
import SVGLoader from '../basics/SVGLoader.vue'
import { useAuthStore, useModalManagerStore, usePostStore } from '@/stores'
import { ModalName, resolvePostMediaList, type PostCard } from '@/common'

const props = defineProps({
  isToggled: { type: Boolean, required: true }
})

const emit = defineEmits(['on-modal-closed'])

const authStore = useAuthStore()
const postStore = usePostStore()
const modalStoreManager = useModalManagerStore()
const router = useRouter()
const toast = useToast()

const post = computed<PostCard | null>(() => modalStoreManager.getActivePost ?? null)

const settings = reactive({
  hideLikes: post.value?.hideLikes ?? false,
  disableComments: post.value?.disableComments ?? false
})

const isPostOwner = computed(() => {
  return !!post.value?.userId && post.value.userId === authStore.user?.id
})

watch(post, (current) => {
  settings.hideLikes = current?.hideLikes ?? false
  settings.disableComments = current?.disableComments ?? false
})

const onClose = () => {
  modalStoreManager.closeModal()
  emit('on-modal-closed')
}

const goToPost = () => {
  if (!post.value?.id) return
  modalStoreManager.closeModal()
  emit('on-modal-closed')
  router.push({ name: 'post', params: { id: post.value.id } })
}

const viewProfile = () => {
  if (!post.value?.userName) return
  modalStoreManager.closeModal()
  emit('on-modal-closed')
  router.push({ name: 'profile', params: { username: post.value.userName } })
}

const onEditPost = () => {
  if (!post.value?.id) return
  modalStoreManager.setActivePost(post.value)
  modalStoreManager.closeModal()
  modalStoreManager.openModal(ModalName.PHOTO)
}

const copyLink = async () => {
  if (!post.value?.id) return
  const resolved = router.resolve({ name: 'post', params: { id: post.value.id } })
  const postUrl = `${window.location.origin}${resolved.href}`

  try {
    await navigator.clipboard.writeText(postUrl)
    toast.success('Link da publicação copiado')
  } catch {
    toast.error('Não foi possível copiar o link')
  }

  onClose()
}

const sharePost = async () => {
  if (!post.value?.id) return
  const resolved = router.resolve({ name: 'post', params: { id: post.value.id } })
  const postUrl = `${window.location.origin}${resolved.href}`
  const shareText = `${post.value.userName}: ${post.value.caption ?? ''}\nOpen: ${postUrl}`

  try {
    if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
      await (navigator as any).share({
        title: `${post.value.userName}'s post`,
        text: shareText,
        url: postUrl
      })
      toast.success('Publicação compartilhada com sucesso')
    } else if (navigator && navigator.clipboard) {
      await navigator.clipboard.writeText(postUrl)
      toast.success('Link compartilhado copiado para a área de transferência')
    } else {
      toast.error('Compartilhamento não suportado')
    }
  } catch {
      toast.error('Não foi possível compartilhar a publicação')
  }

  onClose()
}

const embedPost = async () => {
  if (!post.value?.id) return
  const resolved = router.resolve({ name: 'post', params: { id: post.value.id } })
  const postUrl = `${window.location.origin}${resolved.href}`
  const embedCode = `<iframe src="${postUrl}" width="400" height="500" style="border:0;overflow:hidden;" allowfullscreen></iframe>`

  try {
    await navigator.clipboard.writeText(embedCode)
    toast.success('Código de incorporação copiado')
  } catch {
    toast.error('Não foi possível copiar o código de incorporação')
  }

  onClose()
}

const reportPost = () => {
  toast.success('Publicação reportada')
  onClose()
}

const confirmDelete = async () => {
  if (!post.value?.id) return
  const ok = window.confirm('Tem certeza de que deseja excluir esta publicação?')
  if (!ok) return

  try {
    await postStore.deletePost(post.value.id)
    toast.success('Publicação excluída')
    modalStoreManager.closeModal()
    modalStoreManager.clearActivePost()
    emit('on-modal-closed')

    const profileName = post.value?.userName || authStore.user?.userName || ''
    if (profileName) {
      await router.replace({ name: 'profile', params: { username: profileName } })
      await postStore.fetchByUsername(profileName).catch(() => undefined)
    } else {
      await router.replace({ name: 'home' })
    }
  } catch {
    toast.error(postStore.error ?? 'Não foi possível excluir a publicação')
  }
}

const updateVisibility = async (data: { hideLikes?: boolean; disableComments?: boolean }) => {
  if (!post.value?.id) return
  try {
    const updatedPost = await postStore.updatePost(post.value.id, data)
    modalStoreManager.setActivePost(updatedPost)
    toast.success('Configurações da publicação atualizadas')
  } catch {
    toast.error(postStore.error ?? 'Unable to update post settings')
    // reverte o estado pendente se a atualização falhar
    if (data.hideLikes !== undefined) {
      settings.hideLikes = !data.hideLikes
    }
    if (data.disableComments !== undefined) {
      settings.disableComments = !data.disableComments
    }
  }
}

const toggleHideLikes = () => {
  settings.hideLikes = !settings.hideLikes
  updateVisibility({ hideLikes: settings.hideLikes })
}

const toggleDisableComments = () => {
  settings.disableComments = !settings.disableComments
  updateVisibility({ disableComments: settings.disableComments })
}
</script>
