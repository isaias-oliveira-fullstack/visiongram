<template>
	<div class="flex space-x-3 justify-between pt-3 sm:pt-0">
		<div class="flex space-x-3 p-3">
			<ProfileAvatar :src="comment?.profilePictureUrl" :size="32" />  
                
			<div class="flex flex-col">
				<div 
					class="flex"
					@click="goToUserProfile(comment.userName)">
					<p 
						class="text-ellipsis overflow-hidden font-sans 
                        text-sm text-white">
						<span 
							class="cursor-pointer font-sans 
                        	text-sm font-bold text-white">
							{{ comment.userName }}
						</span>
						{{ comment.content }}
					</p>
				</div>
				<div
					class="group pt-3 flex list-disc space-x-4 font-sans 
                    text-xs font-semibold text-gray-500 flex-wrap ">
					<li class="list-none cursor-pointer">
						{{ comment.createdAt }}
					</li>
					<li 
						class="list-none cursor-pointer text-gray-400 hover:text-white transition"
						@click="onReplyClick">
						Reply
					</li>
                    <li
                        v-if="isOwnComment"
                        class="list-none cursor-pointer text-red-500 hover:text-red-400 transition"
                        @click="deleteComment">
                        Delete
                    </li>
                    <li class="list-none cursor-pointer invisible group-hover:visible">
                        <SVGLoader :icon="'comment-options'" />
                    </li>
                </div>

                <!-- Reply Input Field (inline) -->
                <div v-if="isReplying" class="mt-3 flex flex-col gap-2">
                    <textarea
                        ref="replyInputRef"
                        v-model="replyText"
                        class="bg-slate-900 border border-gray-700 rounded text-sm text-white p-2 resize-none focus:outline-none focus:border-sky-500 placeholder:text-gray-500"
                        placeholder="Responder comentário..."
                        rows="2"
                        @keypress.enter.prevent="submitReply"
                    ></textarea>
                    <div class="flex gap-2">
                        <button
                            class="text-xs px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 transition"
                            @click="cancelReply">
                            Cancelar
                        </button>
                        <button
                            :class="replyText.trim() ? 'bg-sky-500 hover:bg-sky-600 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'"
                            class="text-xs px-3 py-1 rounded transition"
                            :disabled="!replyText.trim()"
                            @click="submitReply">
                            Responder
                        </button>
                    </div>
                </div>

                <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 ml-6 border-l border-gray-700 pl-3 flex flex-col gap-3">
                    <CommentCard
                      v-for="reply in comment.replies"
                      :key="reply.id"
                      :comment="reply"
                      @on-comment-like="emit('onCommentLike', $event)"
                      @on-delete-comment="emit('onDeleteComment', $event)"
                      @on-reply-submit="emit('onReplySubmit', $event)"
                    />
                </div>
            </div>
        </div>
        
		<div 
			class="text-gray-400 text-xs sm:text-xs cursor-pointer"
			@click="triggerCommentLike">
			<SVGLoader 
				v-if="isCommentLiked"
				:icon="'like'" />
			
			<SVGLoader 
				v-else
				:icon="'unlike'" />
		</div>
	</div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CommentCard' })

import {
	computed,
	ref,
	nextTick
} from 'vue'

import {
	SVGLoader,
	ProfileAvatar
} from '@/components'

import {
	goToUserProfile,
    type PostCommentCard
} from '@/common'

import { useAuthStore } from '@/stores'


const prop = defineProps({
    comment: {
        type: Object as () => PostCommentCard,
        required: true
    }
})

const emit = defineEmits([
    'onOpenCommentModal',
    'onCommentLike',
    'onDeleteComment',
    'onReplySubmit'
])

const authStore = useAuthStore()
const isCommentLiked = ref < boolean > (false)
const isOwnComment = computed(() => authStore.user?.userName === prop.comment.userName)
const isReplying = ref < boolean > (false)
const replyText = ref < string > ('')
const replyInputRef = ref < HTMLTextAreaElement | null > (null)

const triggerCommentLike = () => {
	isCommentLiked.value = !isCommentLiked.value
    emit('onCommentLike', prop.comment.id)
}

const onReplyClick = () => {
	isReplying.value = true
	nextTick(() => {
		replyInputRef.value?.focus()
	})
}

const cancelReply = () => {
	isReplying.value = false
	replyText.value = ''
}

const deleteComment = () => {
	emit('onDeleteComment', prop.comment.id)
}

const submitReply = () => {
	if (!replyText.value.trim()) return

	emit('onReplySubmit', {
		commentId: prop.comment.id,
		content: replyText.value.trim()
	})
	
	replyText.value = ''
	isReplying.value = false
}

</script>
