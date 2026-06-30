<template>
    <div class="relative h-full">

        <!-- Carousel wrapper -->
        <div :class="style" class="relative h-full min-h-80 overflow-hidden rounded-2xl bg-black sm:min-h-105">

            <div
                v-for="media in normalizedMedias"
                :id="`carousel-item-${media._idx}`"
                :key="`carousel-media-${media._idx}`"
                class="duration-300 ease-in-out absolute inset-0 transition-all transform"
                :class="{
                    'translate-x-0 z-20': currentIndex === media._idx,
                    '-translate-x-full z-10': prevIndex === media._idx && mediaCount > 1,
                    'translate-x-full z-10': nextIndex === media._idx && mediaCount > 1,
                    'hidden':
                        nextIndex !== media._idx &&
                        prevIndex !== media._idx &&
                        currentIndex !== media._idx
                    }">

                <span
                    class="absolute text-2xl font-semibold text-white -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 sm:text-3xl dark:text-gray-800">
                    {{ media.title }}
                </span>

                <div class="absolute inset-0 p-2 sm:p-3 flex items-center justify-center">
                  <img
                    v-if="media.type === 'image'"
                    :src="media.mediaUrl"
                    class="max-h-full max-w-full object-contain"
                    :alt="media.title"
                    style="object-position: center center;" />

                  <video
                    v-else-if="media.type === 'video'"
                    :muted="isVideoMuted"
                    class="max-h-full max-w-full object-contain"
                    :alt="media.title"
                    @canplay="appendToVideoElements(media._idx, $event)">
                    <source :src="media.mediaUrl" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>

                <!-- Video controls -->
                <button
                    v-if="media.type === 'video' && media._idx in videoElements"
                    id="data-carousel-mute"
                    type="button"
                    class="absolute bottom-0 right-0 z-40 flex items-center justify-center cursor-pointer group focus:outline-none"
                    @click="toggleVideoMute(media._idx)">
                    <span class="inline-flex items-center justify-center rounded-full sm:w-6 sm:h-6 group-focus:outline-none bg-gray-600">
                        <i class="fa-solid text-sm text-gray-300"
                            :class="{
                                'fa-volume-high': !isVideoMuted,
                                'fa-volume-xmark': isVideoMuted
                            }">
                        </i>
                    </span>
                </button>

                <button
                    v-if="media.type === 'video' && media._idx in videoElements"
                    id="data-carousel-play"
                    type="button"
                    class="absolute top-0 right-1/2 left-1/2 z-30 flex items-center justify-center h-full cursor-pointer group focus:outline-none"
                    @click="isVideoPlaying ? pauseVideo(media._idx) : playVideo(media._idx)">
                    <span class="inline-flex items-center justify-center rounded-full sm:w-12 sm:h-12 group-focus:outline-none">
                        <i class="fa-solid text-6xl text-gray-300"
                            :class="{
                                'fa-play': !isVideoPlaying
                            }">
                        </i>
                    </span>
                </button>

                <button
                    v-if="mediaCount > 1"
                    id="data-carousel-prev"
                    type="button"
                    class="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                    @click="moveToPrevMedia()">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 group-focus:outline-none">
                        <i class="pr-6 fa-solid fa-circle-chevron-left text-2xl text-gray-300"></i>
                        <span class="hidden">Previous</span>
                    </span>
                </button>

                <button
                    v-if="mediaCount > 1"
                    id="data-carousel-next"
                    type="button"
                    class="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                    @click="moveToNextMedia()">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full sm:w-10 sm:h-10 group-focus:outline-none">
                        <i class="pl-6 fa-solid fa-circle-chevron-right text-2xl text-gray-300"></i>
                        <span class="hidden">Next</span>
                    </span>
                </button>
            </div>
        </div>

    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import type { PostMedia } from '@/common'

const normalizeCarouselMedias = (medias: PostMedia[]) =>
  medias
    .filter((media) => media?.mediaUrl)
    .map((media, index) => ({
      ...media,
      type: media.type === 'video' ? 'video' : 'image',
      index: typeof media.index === 'number' ? media.index : index
    }))
    .sort((a, b) => a.index - b.index)
    .map((media, index) => ({ ...media, index, _idx: index }))

export default defineComponent({
  name: 'MediaCarousel',
  props: {
    medias: {
      type: Array as () => PostMedia[],
      required: true
    },
    autoNextTimeInterval: {
      type: Number,
      required: false,
      default: 0
    },
    style: {
      type: String,
      required: false,
      default: ''
    }
  },
  emits: ['onNext', 'onPrev', 'onReset'],
  setup(props, context) {
    const normalizedMedias = computed(() => normalizeCarouselMedias(props.medias))
    const mediaCount = computed(() => normalizedMedias.value.length)
    const hasMedias = computed(() => mediaCount.value > 0)

    const currentIndex = ref<number>(hasMedias.value ? 0 : -1)
    const nextIndex = ref<number>(hasMedias.value && mediaCount.value > 1 ? 1 : 0)
    const prevIndex = ref<number>(hasMedias.value && mediaCount.value > 1 ? mediaCount.value - 1 : 0)
    const autoNextTimeInterval = ref<number>(props.autoNextTimeInterval)
    const timeBeforeFirstCall = ref<number>(5000)
    const autoNextTimeout = ref<number | undefined>(undefined)

    const isVideoMuted = ref<boolean>(true)
    const isVideoPlaying = ref<boolean>(false)
    const videoElements = ref<HTMLVideoElement[]>([])

    const updateIndexes = () => {
      if (!hasMedias.value) return
      currentIndex.value = Math.max(0, Math.min(currentIndex.value, mediaCount.value - 1))
      nextIndex.value = currentIndex.value === mediaCount.value - 1 ? 0 : currentIndex.value + 1
      prevIndex.value = currentIndex.value === 0 ? mediaCount.value - 1 : currentIndex.value - 1
    }

    const clearAutoNextTimeout = () => {
      if (autoNextTimeout.value !== undefined) {
        window.clearTimeout(autoNextTimeout.value)
        autoNextTimeout.value = undefined
      }
    }

    const scheduleAutoNext = (useInitialDelay = false) => {
      clearAutoNextTimeout()
      if (!hasMedias.value || autoNextTimeInterval.value <= 0) return
      autoNextTimeout.value = window.setTimeout(
        () => autoTimedNextMedia(autoNextTimeInterval.value),
        useInitialDelay ? timeBeforeFirstCall.value : autoNextTimeInterval.value
      )
    }

    const moveToNextMedia = () => {
      if (!hasMedias.value) return
      currentIndex.value = currentIndex.value === mediaCount.value - 1 ? 0 : currentIndex.value + 1
      updateIndexes()
      scheduleAutoNext()
      context.emit('onNext')
    }

    const moveToPrevMedia = () => {
      if (!hasMedias.value) return
      currentIndex.value = currentIndex.value === 0 ? mediaCount.value - 1 : currentIndex.value - 1
      updateIndexes()
      scheduleAutoNext()
      context.emit('onPrev')
    }

    const resetCarouselIndexes = (currentSelectedMediaIndex: number) => {
      if (!hasMedias.value || currentSelectedMediaIndex < 0 || currentSelectedMediaIndex >= mediaCount.value) return
      currentIndex.value = currentSelectedMediaIndex
      updateIndexes()
      scheduleAutoNext(true)
      context.emit('onReset')
    }

    const toggleVideoMute = (index: number) => {
      const video = videoElements.value[index]
      if (!video) return
      video.muted = !video.muted
      isVideoMuted.value = video.muted
    }

    const pauseVideo = (index: number) => {
      const target = videoElements.value[index]
      if (!target) return
      target.pause()
      isVideoPlaying.value = !target.paused
    }

    const playVideo = (index: number) => {
      const target = videoElements.value[index]
      if (!target) return
      target.play()
      isVideoPlaying.value = !target.paused
    }

    const appendToVideoElements = (index: number, event: Event) => {
      const video = event.target as HTMLVideoElement
      video.muted = isVideoMuted.value
      videoElements.value[index] = video
    }

    const autoTimedNextMedia = (interval: number = autoNextTimeInterval.value) => {
      moveToNextMedia()
      autoNextTimeout.value = window.setTimeout(() => autoTimedNextMedia(interval), interval)
    }

    watch(normalizedMedias, () => {
      currentIndex.value = hasMedias.value ? 0 : -1
      updateIndexes()
      scheduleAutoNext(true)
    }, { immediate: true })

    onMounted(() => scheduleAutoNext(true))
    onBeforeUnmount(() => clearAutoNextTimeout())

    return {
      normalizedMedias,
      mediaCount,
      currentIndex,
      nextIndex,
      prevIndex,
      isVideoMuted,
      isVideoPlaying,
      videoElements,
      moveToNextMedia,
      moveToPrevMedia,
      resetCarouselIndexes,
      toggleVideoMute,
      pauseVideo,
      playVideo,
      appendToVideoElements,
      style: props.style
    }
  }
})
</script>
