<template>
  <div class="relative flex h-dynamic-screen w-full flex-col border-l border-[#262626] bg-[#121212] sm:h-screen">
    <ChatHeader :viewer="activeConversation?.user" @on-chat-back="$emit('onChatBack')" />

    <div class="flex justify-center px-4 pt-4">
      <span v-if="!isChatLoading" class="text-[12px] font-semibold text-[#a8a8a8]">
        {{ formatedDate(activeConversation?.timeSinceLastMessage) }}
      </span>
      <i v-else class="fa-solid fa-spinner fa-spin fa-2xl mt-4 text-[#737373]"></i>
    </div>

    <div class="flex-1 overflow-auto px-3 py-3">
      <ChatMessage
        v-if="activeConversation"
        :is-chat-loading="isChatLoading"
        :active-conversation="activeConversation"
      />
    </div>

    <ChatInput
      :is-chat-empty="isChatEmpty"
      :is-chat-loading="isChatLoading"
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      @on-file-upload="$emit('onFileUpload')"
      @on-like-icon="$emit('onLikeIcon')"
      @on-send-message="$emit('onSendMessage', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import {
} from 'vue'
import {
    ChatInput,
    ChatMessage,
    ChatHeader
} from '@/components'

import type {
    Conversation,
    User
} from '@/common'


defineProps({
    activeConversation: {
        type: Object as () => Conversation | undefined,
        required: true
    },
    isChatLoading: {
        type: Boolean,
        required: true
    },
    isChatEmpty: {
        type: Boolean,
        required: true
    },
    modelValue: {
        type: String as () => string | undefined,
        default: undefined
    },
    currentUser: {
        type: Object as () => User | undefined,
        default: undefined
    }
})

const emit = defineEmits([
    "onLikeIcon",
    "onSendMessage",
    "onFileUpload",
    "onChatBack",
    "update:modelValue"
])

const formatedDate = (date: string | undefined) => {
    if (!date) return ''
	return new Date(date).toLocaleDateString()
}
</script>