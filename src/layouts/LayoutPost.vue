<template>
  <LayoutMain />
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useModalManagerStore } from '@/stores'
import { usePostStore } from '@/stores'
import { ModalName } from '@/common'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import LayoutMain from './LayoutMain.vue'

const route = useRoute()
const router = useRouter()
const modalStoreManager = useModalManagerStore()
const postStore = usePostStore()

const loadPost = async () => {
  const postId = route.params.id as string | undefined
  
  if (!postId) {
    return
  }

  modalStoreManager.clearActivePost()
  modalStoreManager.closeModal()

  try {
    const post = await postStore.fetchPostById(postId)
    if (post) {
      modalStoreManager.setActivePost(post)
      modalStoreManager.openModal(ModalName.POST)
    }
  } catch (err: any) {
    router.push({ name: 'home' })
  }
}

onMounted(() => {
  loadPost()
})

watch(
  () => route.params.id,
  (id) => {
    if (id) {
      loadPost()
    }
  }
)

onBeforeUnmount(() => {
  // Limpa quando sair da rota
  modalStoreManager.closeModal()
  modalStoreManager.clearActivePost()
})
</script>
