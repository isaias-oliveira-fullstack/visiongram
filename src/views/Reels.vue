<template>
    <div 
        :class="isToggledClass"
        class="sm:max-w-lg self-center mx-auto overflow-auto scrollbar scrollbar-none">
        <div class="swiper-container-wrapper">
            <ReelContainer
                :direction="'vertical'"
                :centered-slides="true"
                :space-between="15"
                :slides-per-view="isMobileScreen ? 1.00 : 1.15"
                :loop="reels.length > 3"
                :mousewheel="true"
                :modules="modules"
                :pagination="{
                    clickable: false,
                    bulletClass: 'hidden'   
                }"
                :class="'max-h-screen h-dynamic-screen sm:h-auto \
                sm:rounded-lg self-center swiper-container'"
                @afterInit="updateActiveSlideInstance"
                @active-index-change="updateActiveSlideInstance">
                <ReelSlide
                    v-for="reel of reels"
                    :key="reel.id"
                    :class="'flex flex-col relative max-w-lg sm:max-h-screen'">
                    <ReelCard 
                        :reel="reel"
                        :active-video="activeVideo"
                        @on-comments="toggleCommentModal(reel.comments)"
                        @on-follow-request="handleFollowRequest"
                        @on-like-state-change="handleLikeStateChange" />
                </ReelSlide>
            </ReelContainer>
        </div>
    </div>
	
	<SmallModal 
		:title="commentModal.title"
		:is-toggled="commentModal.isToggled" 
		:items="commentModal.items"
		:modal-type="ModalName.COMMENT" 
		:modal-size="ModalSize.Medium"
		@on-modal-closed="toggleCommentModal" />
</template>

<script setup lang="ts">
// Swiper styles
import 'swiper/css/bundle'
import 'swiper/css'
import 'swiper/css/pagination'

import {
    ref,
    computed,
    onMounted
} from 'vue'

import type { Swiper } from 'swiper'
import { Mousewheel, Pagination } from 'swiper/modules'

import {
	Swiper as ReelContainer,
    SwiperSlide as ReelSlide
} from 'swiper/vue'

import {
    ReelCard,
    SmallModal,
} from '@/components'

import {
    ScreenBreakpoint,
    ModalSize,
    ModalName,
    type PostComment,
    type ReelPost,
} from '@/common'

import { 
    useModalManagerStore 
} from '@/stores'

import { usePostStore } from '@/stores'

// Swiper modules
const modules = [Mousewheel, Pagination]

// Sample data
const reels = ref<ReelPost[]>([])
const postStore = usePostStore()

// Rastreadores
const activeSwiperInstance = ref<Swiper | undefined>()
const activeVideo = ref<HTMLVideoElement>()
const modalStoreManager = useModalManagerStore()

// Outros
const screenWidth = ref<number>(window.innerWidth) // Largura atual da janela
const commentModal = ref({
    name: '',
    title: 'Comments',
    items: [] as PostComment[] | undefined,
    isToggled: false
})

/**
 * Atualiza o slide ativo do Swiper e o vídeo associado
 * @param swiper O novo slide ativo do Swiper
 */
const updateActiveSlideInstance = (swiper: Swiper) => {
    pauseVideo()
    activeSwiperInstance.value = swiper
    const currentIndex = swiper.activeIndex
    const currenSlide = swiper.slides[currentIndex]
    updateActiveVideo(currenSlide)
}

/**
 * Atualiza a variável do vídeo ativo para corresponder ao slide atual
 * @param currentSlide O slide atualmente exibido
 */
const updateActiveVideo = (currentSlide: HTMLElement) => {
    activeVideo.value = currentSlide?.querySelector(
        'video'
    ) as HTMLVideoElement
    playVideo() // Auto play new active 
}

/**
 * Alterna o estado de follow de um reel ao clicar
 * @param activeReel O reel afetado
 */
const handleFollowRequest = (activeReel: ReelPost) => {
    activeReel.isFollowed = !activeReel.isFollowed
}

/**
 * Atualiza o estado de like de um reel ao clicar
 * @param reel O reel que recebeu a ação
 */
const handleLikeStateChange = (reel: ReelPost) => {
    reel.likeCount += reel.hasLiked ? -1 : +1
    reel.hasLiked = !reel.hasLiked
}

/**
 * Define o primeiro slide de mídia quando o Swiper estiver montado
 * @param swiper O primeiro slide do Swiper
 */
const initializeSlideInstance = (swiper: Swiper) => {
	activeSwiperInstance.value = swiper
}


const toggleCommentModal = (comments: PostComment[] | undefined) => {
    commentModal.value.items = comments
    commentModal.value.isToggled = !commentModal.value.isToggled
    modalStoreManager.toggleModal(ModalName.REEL)
}

const pauseVideo = () => {
    activeVideo.value?.pause()
}

const playVideo = () => {
    activeVideo.value?.play()
}

const isMobileScreen = computed(() => {
    return screenWidth.value <= ScreenBreakpoint.Medium
})

onMounted(() => {
    screenWidth.value = window.innerWidth // Define o valor inicial com a largura atual da tela
    // acompanha a largura da tela caso ela mude no futuro
    window.onresize = () => {
        screenWidth.value = window.innerWidth
    }
    // Popula reels a partir de posts usando o tipo de mídia explícito quando disponível
    postStore.fetchFeed().then(() => {
        const items = postStore.posts
            .map((p) => {
                const mediaUrl = p.mediaUrl ?? p.carouselMedia?.[0]?.mediaUrl ?? p.imageUrl
                const mediaType = p.mediaType ?? (p.carouselMedia?.[0]?.type ?? (p.imageUrl ? 'image' : undefined))
                if (!mediaUrl || !mediaType) return null

                return {
                    post: p,
                    mediaUrl,
                    mediaType
                }
            })
            .filter((item): item is { post: typeof postStore.posts[number]; mediaUrl: string; mediaType: 'image' | 'video' } => item !== null)

        const videoPosts = items
            .filter((item) => item.mediaType === 'video')
            .map((item) => ({
                id: item.post.id,
                userName: item.post.userName,
                profilePictureUrl: item.post.profilePictureUrl,
                caption: item.post.caption,
                likeCount: item.post.likeCount,
                hasLiked: item.post.hasLiked,
                isFollowed: item.post.isFollowed,
                commentCount: item.post.commentCount,
                comments: item.post.comments,
                reelMedia: {
                    type: 'video' as const,
                    mediaUrl: item.mediaUrl,
                    title: item.post.caption ?? '',
                    location: ''
                }
            }))

        if (videoPosts.length > 0) {
            reels.value = videoPosts
        } else {
            reels.value = items
                .slice(0, 30)
                .map((item) => ({
                    id: item.post.id,
                    userName: item.post.userName,
                    profilePictureUrl: item.post.profilePictureUrl,
                    caption: item.post.caption,
                    likeCount: item.post.likeCount,
                    hasLiked: item.post.hasLiked,
                    isFollowed: item.post.isFollowed,
                    commentCount: item.post.commentCount,
                    comments: item.post.comments,
                    reelMedia: {
                        type: item.mediaType,
                        mediaUrl: item.mediaUrl,
                        title: item.post.caption ?? '',
                        location: ''
                    }
                }))
        }
    }).catch(() => {})
})

const isToggledClass = computed(() => {
    return commentModal.value.isToggled ? "lights-off" : ""
})
</script>

<style scoped>
.blur-filter {
    filter: blur(30px);
}

.transparent-black {
    background-color: rgba(0,0,0,.5);
}

.transparent-gray {
    background-color:rgba(134, 134, 134, 0.5);
}

/**
* Oculta controladores de vídeo em celulares    
*/
video::-webkit-media-controls-start-playback-button {
    display: none;
}

.swiper-container-wrapper {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.sticky-test { 
  bottom: env(safe-area-inset-bottom);
}
</style>