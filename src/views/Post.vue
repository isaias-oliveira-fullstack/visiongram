<template>
  <div class="flex flex-col space-y-4 max-w-3xl mx-auto p-4">
    <div v-if="isLoading" class="text-center text-white py-20">Carregando publicação...</div>
    <div v-else-if="error" class="text-center text-red-400 py-20">{{ error }}</div>
    <div v-else-if="post">
      <div class="mb-4">
        <button class="text-sm text-sky-400 hover:text-sky-200" @click="goBack">← Voltar</button>
      </div>
      <PostCard
        :post="post"
        :is-comment-area-visible="false"
        @on-post-save="onPostSave"
      />
    </div>
    <div v-else class="text-center text-white py-20">Publicação não encontrada.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PostCard } from '@/components'
import { usePostStore } from '@/stores'
import type { PostCard as PostCardType } from '@/common'

const postStore = usePostStore()
const route = useRoute()
const router = useRouter()
const post = ref<PostCardType | null>(null)
const isLoading = ref(false)
const error = ref('')

const loadPost = async () => {
  const id = route.params.id as string | undefined
  if (!id) {
    error.value = 'ID da publicação inválido.'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const fetched = await postStore.fetchPostById(id)
    post.value = fetched
  } catch (err: any) {
    error.value = postStore.error ?? err?.message ?? 'Não foi possível carregar a publicação.'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadPost()
})

const onPostSave = async (postId: string) => {
  if (!postId) return
  try {
    if (post.value?.id !== postId) {
      return
    }

    if (post.value.isSaved) {
      await postStore.unsavePost(postId)
    } else {
      await postStore.savePost(postId)
    }

    const updated = postStore.posts.find((p) => p.id === postId) ?? postStore.savedPosts.find((p) => p.id === postId)
    if (updated) {
      post.value = updated
    }
  } catch {
    // ignora erros; o store cuida das mensagens
  }
}
</script>
