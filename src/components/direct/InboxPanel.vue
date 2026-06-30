<template>
  <div :class="{ 'hidden': activeConversation }" class="hidden border-r border-[#262626] bg-[#121212] md:block md:w-90 lg:w-[320px]">
    <InboxHeader :current-user="currentUser" />

    <div class="h-[calc(100vh-72px)] overflow-auto px-2 py-2">
      <InboxMessages
        :active-conversation-id="activeConversation?.uuid"
        :conversations="conversations"
        @on-select-conversation="$emit('onSelectConversation', $event as Conversation)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
    InboxMessages,
    InboxHeader
} from '@/components'

import type {
    Conversation,
    Viewer
} from '@/common'

defineProps({
    conversations: {
        type: Object as() => Conversation[] | undefined,
        required: true
    },
    activeConversation: {
        type: Object as() => Conversation | undefined,
        required: true
    },
    currentUser: {
        type: Object as() => Viewer,
        required: true
    },
})

const emit = defineEmits(['onSelectConversation'])
</script>