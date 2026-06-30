<template>
    <div class="flex flex-wrap">
        <div
            v-for="(post, index) of posts"
            :key="post.id || index"
            :class="['p-0.5 relative hover:brightness-75 group hover:cursor-pointer', getTileClass(index)]"
            @click="handlePostCover(post)">

            <div class="flex absolute space-x-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:group-hover:visible invisible">
                <div class="flex font-bold text-white text-md space-x-1">
                    <i class="fa-solid fa-heart mt-1"></i>
                    <span>{{ post.likeCount }}</span>
                </div>
                <div class="flex font-bold text-white text-md space-x-1">
                    <i class="fa-solid fa-comment mt-1"></i>
                    <span>{{ post.commentCount }}</span>
                </div>
            </div>

            <div class="relative aspect-square overflow-hidden rounded-xl bg-black flex items-center justify-center">
              <img
                v-if="resolvePostMediaList(post).length"
                :src="resolvePostMediaList(post)[0]?.mediaUrl"
                class="max-h-full max-w-full object-contain"
                style="object-position: center center;"
              />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, type PropType } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import { resolvePostMediaList, type PostCard as PostCardType } from '@/common'
import { useModalManagerStore } from '@/stores'

defineProps({
    posts: {
        type: Object as PropType<PostCardType[]>,
        required: true
    }
})

const modalStoreManager = useModalManagerStore()
const route = useRoute()

const getTileClass = (index: number) => {
    if ((index + 1) % 7 === 0) return 'basis-full sm:basis-2/3 lg:basis-1/2'
    if ((index + 1) % 5 === 0) return 'basis-1/2 sm:basis-1/3'
    return 'basis-1/3'
}

const activePost = ref<PostCardType | undefined>(undefined)

const openCommentModal = () => {
    modalStoreManager.setActivePost(activePost.value)
    const params = { id: activePost.value?.id }
    router.push({
        name: 'post',
        params,
        query: { from: route.fullPath }
    })
}

const handlePostCover = (post: PostCardType) => {
    activePost.value = post
    openCommentModal()
}
</script>