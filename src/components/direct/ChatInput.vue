<template>
	<div class="flex absolute inset-x-3 md:bottom-2 bottom-8 rounded-full space-x-3">
		<!-- Emojis -->
		<div
			class="cursor-pointer inset-y-0 left-0 \
                    flex items-center">
			<span class="relative">
				<EmojiPickerModal
					:toggle-direction="'left'" 
					@select-emoji="appendEmoji" />
			</span>
		</div>                             
                
		<!-- Chat Area -->
		<textarea
			ref="textArea"
			tabindex="1"
			rows="1"
			maxlength="100"
			type="text"
			class="bg-black border border-[#262626] text-white 
                rounded-full text-sm focus:outline-none disabled:cursor-not-allowed
                block w-full p-2.5 resize-none"
			placeholder="Mensagem..."
			:class="{ 'rounded-lg ': !isChatEmpty }"
            :value="modelValue" 
            :disabled="isChatLoading"
            @input="onInput"
            @keyup.enter.prevent="emitSendMessage"></textarea>

		<!-- Like/Heart -->
		<div
			class="self-center"
			:class="{ 'hidden': !isChatEmpty }"
			@click="emitLikeIcon()">
			<SVGLoader
				:icon="'like'" 
				:class="'cursor-pointer md:absolute inset-y-0 right-12 \
                    flex items-center'" />     
		</div>
	</div>
</template>

<script setup lang="ts">
import {
    ref
} from 'vue'

import {
    EmojiPickerModal,
    SVGLoader
} from '@/components'

import type {
    Emoji
} from '@/common'

defineProps({
    modelValue: {
        type: String as () => string | null | undefined,
        default: undefined
    },
    isChatEmpty: {
        type: Boolean,
        required: true
    },
	isChatLoading: {
		type: Boolean,
		required: true
	}
})

const emit = defineEmits([
    "onLikeIcon",
    "onSendMessage",
    "onFileUpload",
    "update:modelValue"
])

const textArea = ref<HTMLTextAreaElement | null>()

const onInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    emit('update:modelValue', target.value)
}

const emitSendMessage = () => {
    const text = textArea.value?.value?.trim() ?? ''
    if (!text) {
        return
    }

    emit('onSendMessage', text)
}

const emitLikeIcon = () => {
    emit('onLikeIcon')
}

const emitFileUpload = () => {
    emit('onFileUpload')
}

const appendEmoji = (emoji: Emoji) => {
    if (textArea.value) {
        textArea.value.focus()
        const nextValue = `${textArea.value.value}${emoji.i}`
        textArea.value.value = nextValue
        emit('update:modelValue', nextValue)
    }
}
</script>