<template>
    <CommentModal 
        :is-toggled="isCommentModalOpen"
        @on-add-comment="handleAddComment"
        @on-delete-comment="handleDeleteComment"
        @on-post-liked="handlePostLike"
        @on-reply-submit="handleReplySubmit"
        @on-modal-closed="handleCommentModalClosed" />

    <PostModal
        :is-toggled="isPostModalOpen"
        :post="activePost"
        @on-modal-closed="handlePostModalClosed"
        @on-post-liked="handlePostLike"
        @on-add-comment="handleAddComment"
        @on-delete-comment="handleDeleteComment"
        @on-reply-submit="handleReplySubmit"
    />

    <PostOptionsModal
        :is-toggled="isPostOptionsModalOpen"
        @on-modal-closed="handlePostOptionsModalClosed" />

    <PhotoModal
        v-if="isPhotoModalOpen"
        :is-toggled="isPhotoModalOpen"
        @on-file-upload="uploadedFileData" />
</template>

<script setup lang="ts">
import {
    computed, ref,
} from 'vue'

import {
    useRouter
} from 'vue-router'

import {
    CommentModal,
    PhotoModal,
    PostModal,
    PostOptionsModal,
} from '@/components'

import {
    ModalName
} from '@/common'

import { 
    useModalManagerStore, usePhotoStore
} from '@/stores'

import { usePostStore } from '@/stores'
import { useToast } from 'vue-toastification'

const postStore = usePostStore()
const toast = useToast()

const handleAddComment = async (commentText: string) => {
    const active = modalStoreManager.getActivePost
    if (!active || !active.id) return
    try {
        await postStore.createComment(active.id, commentText)
        const updatedPost = postStore.posts.find((item) => item.id === active.id)
        if (updatedPost) {
            modalStoreManager.setActivePost(updatedPost)
        }
        toast.success('Comment added')
    } catch {
        toast.error(postStore.error ?? 'Unable to add comment')
    }
}

const handleDeleteComment = async (commentId: string) => {
    const active = modalStoreManager.getActivePost
    if (!active || !active.id) return
    try {
        await postStore.deleteComment(active.id, commentId)
        const updatedPost = postStore.posts.find((item) => item.id === active.id)
        if (updatedPost) {
            modalStoreManager.setActivePost(updatedPost)
        }
        toast.success('Comment deleted')
    } catch {
        toast.error(postStore.error ?? 'Unable to delete comment')
    }
}

const handleReplySubmit = async (replyData: { commentId: string; content: string }) => {
    const active = modalStoreManager.getActivePost
    if (!active || !active.id) return
    try {
        await postStore.createReply(active.id, replyData.commentId, replyData.content)
        const updatedPost = postStore.posts.find((item) => item.id === active.id)
        if (updatedPost) {
            modalStoreManager.setActivePost(updatedPost)
        }
        toast.success('Reply added')
    } catch (e) {
        toast.error(postStore.error ?? 'Unable to add reply')
    }
}

const handlePostLike = async (postId: string) => {
    try {
        await postStore.toggleLike(postId)
        
        // Refetch the post to ensure modal shows latest state
        const updatedPost = await postStore.fetchPostById(postId)
        if (updatedPost) {
            modalStoreManager.setActivePost(updatedPost)
        }
        toast.success('Like updated')
    } catch {
        toast.error(postStore.error ?? 'Unable to like post')
    }
}

const handleCommentModalClosed = () => {
    modalStoreManager.closeModal()
}

const handlePostOptionsModalClosed = () => {
    modalStoreManager.closeModal()
    const currentRoute = router.currentRoute.value
    const active = modalStoreManager.getActivePost

    if (currentRoute && currentRoute.name === 'post' && active) {
        modalStoreManager.openModal(ModalName.POST)
        return
    }

    modalStoreManager.clearActivePost()
}

const handlePostModalClosed = () => {
    modalStoreManager.closeModal()
    modalStoreManager.clearActivePost()
    try {
        const currentRoute = router.currentRoute.value
        if (currentRoute && currentRoute.name === 'post') {
            const fromQuery = currentRoute.query.from
            const fromPath = Array.isArray(fromQuery)
                ? fromQuery[0]
                : fromQuery as string | undefined

            if (fromPath && fromPath !== currentRoute.fullPath) {
                router.replace(fromPath)
            } else {
                router.replace({ name: 'home' })
            }
        } else if (window.history.length > 1) {
            router.back()
        } else {
            router.replace({ name: 'home' })
        }
    } catch (e) {
        router.replace({ name: 'home' })
    }
}

const windowWidth = ref(window.innerWidth)
// Services
const router = useRouter()
const modalStoreManager = useModalManagerStore()
const photoStore = usePhotoStore()

/**
 * Get uploaded file data and redirect to image view
 */
 const uploadedFileData = () => {
    // Go to image view only when screen size is extra small (i.e: Phone screen)
    if (windowType.value === 'xs')
        router.push({
            name: 'style'
        })
    photoStore.isToggled = true // Aciona o photoModal na visualização mobile
}

/**
 * Get current screen width
 */
 const windowType = computed(() => {
    if (windowWidth.value < 550) return 'xs'
    return null
})

const isCommentModalOpen = computed(() => {
    return modalStoreManager.getOpenModal === ModalName.COMMENT
})

// const isProfileModalOpen = computed(() => {
//     return modalStoreManager.getOpenModal === ModalName.PROFILE
// })

const activePost = computed(() => modalStoreManager.getActivePost)

const isPostModalOpen = computed(() => {
    return modalStoreManager.getOpenModal === ModalName.POST
})

const isPostOptionsModalOpen = computed(() => {
    return modalStoreManager.getOpenModal === ModalName.POST_OPTIONS
})

const isPhotoModalOpen = computed(() => {
    return !isPostModalOpen.value && !isPostOptionsModalOpen.value && (modalStoreManager.getOpenModal === ModalName.PHOTO || photoStore.isToggled)
})
</script>