<template>
	<div class="container flex max-w-full w-full sm:h-screen bg-[#1a1a1a] space-y-5 sm:p-2">
		<StoryContainer
			:centered-slides="true"
			:modules="modules"
			:effect="'cube'"
			:cube-effect="{
				shadow: true,
				slideShadows: true,
				shadowOffset: 20,
				shadowScale: 0.94,
			}"
			:autoplay="{
				delay: 25000,
				disableOnInteraction: false,
			}"
			:navigation="{
				enabled: true
			}"
			:initial-slide="initialSlide"
			:class="'sm:max-w-md lg:max-w-lg sm:rounded-lg w-screen self-center swiper-container'"
			@autoplayTimeLeft="onAutoplayTimeLeft"
			@after-init="initializeSlideInstance"
			@active-index-change="updateActiveSlideInstance">
			<StorySlide
				v-for="(story, index) in stories"
				:key="index">
				<StoryCard
					:story="story"
					:active-story-media="activeStoryMedia"
					:active-story-type="activeStoryType"
					:progress-percentage="progressPercentage" 
					:is-story-playing="isStoryPlaying" 
					@on-like-status="updateLikeStatus"
					@on-modal-closed="onModalClosed"
					@on-send-message="" />
			</StorySlide>
		</StoryContainer>

		<!-- Close mark -->
		<div class="absolute right-6 z-50 sm:hover:cursor-pointer md:block hidden">
			<SVGLoader
				:icon="'cross-large'"
				@click="onModalClosed()" />
		</div>

		<!-- Instagram Logo -->
		<div class="absolute top-0 left-6 z-50 md:block hidden">
			<SVGLoader :icon="'instagram-large'" />
		</div>
	</div>
</template>

<script setup lang="ts">
// Estilos do Swiper
// import 'swiper/css/bundle'
// import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import {
    ref,
    computed,
    provide,
    watchEffect,
    onMounted
} from 'vue'

import { useRoute } from 'vue-router'
import type { Swiper } from 'swiper'
import { Mousewheel, Pagination, EffectCube, Autoplay, Navigation } from 'swiper/modules'

import {
	Swiper as StoryContainer,
    SwiperSlide as StorySlide
} from 'swiper/vue'

import {
    useRouter
} from 'vue-router'

import {
    SVGLoader,
    StoryCard
} from '@/components'
import { DEFAULT_PROFILE_PICTURE } from '@/common/constants'

import {
    type StoryCarousel,
    type StoryType,
    type StoryMedia,
    type PostCard as PostCardType,
    type PostMedia,
    StoryTypeEnum,
    ZERO_PERCENTAGE,
    ONE_HUNDRED_PERCENTAGE
} from '@/common'

import { usePostStore } from '@/stores'

// Swiper modules
const modules = [
    Mousewheel,
    Pagination,
    EffectCube,
    Autoplay,
    Navigation
]


// Dados
const progressPercentage = ref(ZERO_PERCENTAGE)
const postStore = usePostStore()
const route = useRoute()

const mapPostsToStories = (postCards: PostCardType[]): StoryCarousel[] => {
    const uniqueUsers = new Set<string>()
    return postCards.reduce<StoryCarousel[]>((stories, post) => {
        if (stories.length >= 10) return stories

        if (!uniqueUsers.has(post.userName)) {
            const avatar = post.profilePictureUrl || DEFAULT_PROFILE_PICTURE
            const primaryMediaUrl = post.mediaUrl ?? post.imageUrl
            const primaryMediaType = post.mediaType ?? (post.carouselMedia?.[0]?.type ?? (post.imageUrl ? 'image' : undefined))
            const mediaItems: PostMedia[] = post.carouselMedia?.length
                ? post.carouselMedia
                : primaryMediaUrl
                    ? [{ index: 0, type: primaryMediaType === 'video' ? 'video' : 'image', mediaUrl: primaryMediaUrl }]
                    : []

            if (mediaItems.length > 0) {
                uniqueUsers.add(post.userName)
                stories.push({
                    id: Number(post.id) || stories.length + 1,
                    userName: post.userName,
                    profilePictureUrl: avatar,
                    expiringAt: '24h',
                    seen: false,
                    hasLiked: post.hasLiked,
                    items: mediaItems,
                    mediaCount: mediaItems.length
                })
            }
        }

        return stories
    }, [])
}

const stories = computed<StoryCarousel[]>(() => mapPostsToStories(postStore.posts))
const selectedStoryId = computed(() => {
    const queryId = route.query.storyId
    if (Array.isArray(queryId)) {
        return Number(queryId[0]) || 0
    }
    return Number(queryId ?? 0)
})
const initialSlide = computed(() => {
    const index = stories.value.findIndex((story) => story.id === selectedStoryId.value)
    return index >= 0 ? index : 0
})

// Rastreadores
const activeSwiperInstance = ref<Swiper | undefined>()
const activeStoryMedia = ref<StoryMedia>(undefined)
const activeStoryType = ref<StoryType>(null)

// Verificadores
const isToggled = ref<boolean>(false)
const isStoryPlaying = ref<boolean>(false)

// Serviços
const router = useRouter()

// Métodos 
const toggleModel = () => {
    isToggled.value = !isToggled.value
}

/**
 * Atualiza a porcentagem de progresso da história
 * @param percentage A porcentagem da história
 */
const updateProgressPercentage = (percentage: number) => {
    const newPercentage = (1 - percentage) * ONE_HUNDRED_PERCENTAGE
    progressPercentage.value = newPercentage >= ONE_HUNDRED_PERCENTAGE ? ONE_HUNDRED_PERCENTAGE : newPercentage
}

/**
 * Alterna o status de curtir da história
 * @param story A história a ser atualizada
 */
const updateLikeStatus = (story: StoryCarousel) => {
    story.hasLiked = !story.hasLiked
}

// Controladores de story
const resumeStory = () => {
    activeSwiperInstance.value?.autoplay.resume()
}

const pauseStory = () => {
    activeSwiperInstance.value?.autoplay.pause()
}

const onNextStory = () => {
    activeSwiperInstance.value?.slideNext()
}

const onPrevStory = () => {
    activeSwiperInstance.value?.slidePrev()
}

/**
 * Atualiza a porcentagem de progresso da história
 * @param _
 * @param __
 * @param percentage A porcentagem da história
 */
const onAutoplayTimeLeft = (_: Swiper, __: number, percentage: number) => {
    updateProgressPercentage(percentage)
}

onMounted(() => {
    if (!postStore.posts.length) {
        postStore.fetchFeed().catch(() => {
            // ignora erros do feed no visualizador de stories por enquanto
        })
    }
})

watchEffect(() => {
    const swiper = activeSwiperInstance.value
    if (!swiper || !stories.value.length) {
        return
    }

    const targetIndex = initialSlide.value
    if (swiper.activeIndex !== targetIndex) {
        swiper.slideTo(targetIndex)
    }
})

const pauseStoryVideo = () => {
    if (activeStoryType.value === StoryTypeEnum.Video) {
        const video = activeStoryMedia.value as HTMLVideoElement
        video?.pause()
    }
}

/**
 * Define o primeiro slide de mídia quando o Swiper estiver montado
 * @param swiper O primeiro slide do Swiper
 */
const initializeSlideInstance = (swiper: Swiper) => {
    activeSwiperInstance.value = swiper
}

/**
 * Atualiza a mídia ativa para corresponder ao slide atual
 * @param currentSlide O slide atualmente ativo
 */
const updateActiveStory = (currentSlide: HTMLElement) => {
    const image = currentSlide.querySelector('img') as HTMLImageElement
    const video = currentSlide.querySelector('video') as HTMLVideoElement

    activeStoryMedia.value = video || image
    activeStoryType.value = video ? StoryTypeEnum.Video : StoryTypeEnum.Image
}

/**
 * Atualiza o slide ativo do Swiper e a mídia associada
 * @param swiper O novo slide ativo do Swiper
 */
const updateActiveSlideInstance = (swiper: Swiper) => {
    activeSwiperInstance.value = swiper
    const currentIndex = swiper.activeIndex
    const currenSlide = swiper.slides[currentIndex]
    pauseStoryVideo()
    updateActiveStory(currenSlide)
    resumeStory()
}

/**
 * Validate the length of the stories array and redirect to home if empty
 */
// Observadores
/**
 * Reset or set percentage progress based on slide index
 */
watchEffect(() => {
    if (progressPercentage.value >= ONE_HUNDRED_PERCENTAGE) {
        const swiper = activeSwiperInstance.value
        if (swiper && !swiper.isEnd) {
            updateProgressPercentage(ZERO_PERCENTAGE)
            onNextStory()
        }
    }
})

// Event Listeners
/**
 * Emit signal when the modal is closed
 * @event modal-closed
 */
const onModalClosed = () => {
    setTimeout(() => {
        router.push({
            path: '/'
        })
    }, 100)
}

// Providers for child components
provide(
    'pauseStory', pauseStory
)

provide(
    'resumeStory', resumeStory
)

onMounted(async () => {
    try {
        await postStore.fetchFeed()
    } catch {
        // ignora erros da feed no visualizador de stories por enquanto
    }
})
</script>

<style scoped>
/* Hide next/back controllers */
.swiper-button-next, .swiper-button-prev {
    color: transparent;
}
</style>