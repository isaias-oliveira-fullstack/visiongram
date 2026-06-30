<template>
    <div class="relative sm:w-full sm:h-full w-screen transition-all duration-300 mx-auto bg-gray-700">

        <StoryProgressBar 
            :progress-percentage="progressPercentage" />

        <StoryHeader 
            ref="storyHeaderRef"
            :story="story"
            :is-comment-input-focused="isCommentInputFocused"
            :active-story-media="activeStoryMedia"

            :active-story-type="activeStoryType"
            @on-modal-closed="$emit('onModalClosed')"
            @on-pause-story="pauseStory"
            @on-resume-story="resumeStory" />

        <StoryMediaDisplay 
            :story="story"
            :is-comment-input-focused="isCommentInputFocused"/>

        <StoryCommentInput 
            :story="story"
            @on-comment-focus="onCommentFocus"
            @on-like-status="$emit('onLikeStatus', $event)"
            @on-send-message="$emit('onSendMessage', $event)" />

    </div>
</template>

<script setup lang="ts">
import { 
    ref,
    watchEffect, 
    inject, 
    type PropType 
} from 'vue'

import type {
    StoryCarousel,
    StoryType,
    StoryMedia
} from '@/common'

import {
    StoryProgressBar,
    StoryMediaDisplay,
    StoryCommentInput,
    StoryHeader
}
from '@/components'

// Props
const prop = defineProps({
    story: {
        type: Object as PropType<StoryCarousel> ,
        required: true
    },
    activeStoryMedia: {
        type: null as unknown as PropType<StoryMedia> ,
        required: true
    },
    activeStoryType: {
        type: null as unknown as PropType<StoryType> ,
        required: true
    },
    progressPercentage: {
        type: Number,
        required: true
    }
})

// Emissores
defineEmits([
    'onModalClosed',
    'onSendMessage',
    'onLikeStatus',
])

// Acessando funções do componente pai
const triggerPauseStory = inject('pauseStory') as () => void
const triggerResumeStory = inject('resumeStory') as () => void

// Referências
const isCommentInputFocused = ref(false)
const storyHeaderRef = ref<InstanceType<typeof StoryHeader>>()

// Métodos
const resumeStory = () => {
    const storyHeaderMethods = storyHeaderRef.value
    if (storyHeaderMethods) {
        triggerResumeStory()
        storyHeaderMethods.playStory()
        prop.activeStoryType === 'Video' && storyHeaderMethods.playStoryVideo()
    }
}

const pauseStory = () => {
    const storyHeaderMethods = storyHeaderRef.value
    if (storyHeaderMethods) {
        triggerPauseStory()
        storyHeaderMethods.pauseStory()
        storyHeaderMethods.pauseStoryVideo()
    }
}

const onCommentFocus = () => {
    isCommentInputFocused.value = !isCommentInputFocused.value
}

// Observadores
/**
 * Pause story progress when comment input is focused
 */
watchEffect(() => {
    isCommentInputFocused.value ? pauseStory() : resumeStory()
})
</script>