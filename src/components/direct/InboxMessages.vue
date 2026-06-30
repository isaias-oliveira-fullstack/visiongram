<template>
	<div 
        v-for="(convo, index) of conversations"
		v-if="conversations"
		:key="index"
		class="flex flex-col md:block pl-2 pr-2"
		@click="emitSelectConversation(convo)">
		<div 
			:class="{ 'bg-slate-1100': convo.uuid === activeConversationId }"
			class="flex p-3 space-x-3 sm:hover:bg-slate-1100 w-full cursor-pointer">
			<!-- Profile Image -->
			<ProfileAvatar :src="convo.user.profilePictureUrl" :size="56" class="shadow-lg" />


			<!-- Username / Chat / Date -->
			<div class="flex flex-col self-center space-y-2 pb-3">
				<span class="font-sans text-xs sm:text-sm font-semibold text-white self-start">
					{{ convo.user.userName }}
				</span>

				<div class="flex flex-row space-x-1">
					<span class="font-sans text-xs font-semibold text-gray-400">
						{{ convo.lastMessage }}
					</span>

					<div class="font-sans text-xs font-semibold text-gray-500">
						•
					</div>

					<div class="font-sans font-semibold text-xs text-gray-500 justify-self-end">
						{{ formatedDate(convo.timeSinceLastMessage) }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type {
    Conversation
} from '@/common/models'
import ProfileAvatar from '../core/basics/ProfileAvatar.vue'

defineProps({
    conversations: {
        type: Object as() => Conversation[] | undefined,
        required: true
    },
    activeConversationId: {
        type: String as() => Conversation['uuid'] | undefined,
        default: undefined
    }
})

const emit = defineEmits(['onSelectConversation'])

/**
 * Emit new message
 */
const emitSelectConversation = (conversation: Conversation) => {
    emit('onSelectConversation', conversation)
}

const formatedDate = (date: string) => {
	return new Date(date).toLocaleDateString()
}
</script>