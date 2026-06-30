<template>
    <div 
        :class="class"
        class="flex flex-inital flex-row text-center space-x-1">
        <button
            type="button"
            class="cursor-pointer"
            @click.stop="navigateToProfile">
            <ProfileAvatar :src="profileImage" :size="40" />
        </button>
        
        <div class="flex pl-1.5 pt-2 space-x-2">
            <button
                type="button"
                class="font-sans text-md text-white self-start cursor-pointer text-left"
                @click.stop="navigateToProfile">
                <slot name="user-name"></slot>
            </button>
            <span class="font-sans text-md text-white self-start">
                ·
            </span>
            <span
                class="font-sans font-semibold text-sm text-white pt-1 cursor-pointer"
                @click="$emit('onActionClick')">
                <slot name="action-name"></slot>
            </span>
        </div>

    </div>

    <button 
        v-if="showButton"
        type="button" 
        class="flex-inital self-end text-gray-900 
        border border-gray-200 font-semibold 
        bg-white sm:hover:bg-gray-100 rounded-lg 
        text-sm p-1.5 px-6 py-1.5"
        @click.stop="$emit('onActionClick')">
            <slot name="button-name"></slot>
    </button>
    
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import ProfileAvatar from '../basics/ProfileAvatar.vue'

const props = defineProps({
    profileImage: { type: String },
    profileLink: { type: String },
    class: {
        type: String,
        required: false
    },
    showButton: {
        type: Boolean,
        required: false,
        default: false
    }
})

const emit = defineEmits([
    'onActionClick'
])

const router = useRouter()

const navigateToProfile = () => {
    const username = props.profileLink?.trim()
    if (!username) return

    router.push({ name: 'profile', params: { username } })
}
</script>