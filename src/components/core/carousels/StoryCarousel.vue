<template>
  <div class="w-full bg-transparent px-2 py-3 sm:px-3">
    <div class="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#262626]">
      <button
        v-for="(reel, index) of reels"
        :key="index"
        class="flex min-w-18 flex-none flex-col items-center gap-2 rounded-2xl px-1 py-2 transition hover:bg-[#1b1b1b]"
        @click="loadStory(reel.id)"
      >
        <div :class="{ 'animate-pulse': isRotating && index === activeIndex }" class="story-avatar" @click="rotateAvatar(index)">
          <div class="relative block rounded-full bg-white">
            <ProfileAvatar :src="reel.profilePictureUrl" :size="56" class="bg-black p-0.5" />
          </div>
        </div>
        <span class="max-w-18 truncate text-[12px] font-medium text-[#f5f5f5]">{{ reel.userName }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProfileAvatar from '../basics/ProfileAvatar.vue'
import { useRouter } from 'vue-router'

import type { StoryCarousel } from '@/common'

defineProps<{
    reels: StoryCarousel[]
}>()

const isRotating = ref(false)
const activeIndex = ref<number>()

// Services
const router = useRouter()

const rotateAvatar = (number: number) => {
    isRotating.value = !isRotating.value
    activeIndex.value = number
}

const loadStory = (id: string | number) => {
    router.push({
        name: 'stories',
        query: { storyId: String(id) }
    })
}
</script>

<style scoped>
.story-avatar {
    position: relative;
    border-radius: 50%;
    padding: 2.5px;
    background-image: linear-gradient(to right top,#ffc600 20%,#ff0040,#e600cc 80%);
}
</style>