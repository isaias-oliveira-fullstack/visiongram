<template>
  <div class="mx-auto flex max-w-243.75 flex-col px-3 pb-10 pt-3 sm:px-4 sm:pt-6">
    <MobileSearchBar />

    <div class="mt-4 rounded-2xl border border-[#262626] bg-[#121212] p-3 sm:p-4">
      <ExplorePostRenderer v-if="posts.length > 0" :posts="posts" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePostStore } from '@/stores'
import { MobileSearchBar, ExplorePostRenderer } from '@/components'
import type { PostCard as PostCardType } from '@/common'

const postStore = usePostStore()
const posts = computed<PostCardType[]>(() => postStore.posts)

onMounted(() => {
  postStore.fetchFeed().catch(() => {
    // ignora erros por enquanto
  })
})
</script>