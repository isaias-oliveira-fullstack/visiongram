<template>
    <div 
        class="flex rounded-lg items-center space-x-2 w-full p-2 h-12 cursor-pointer
         justify-between sm:max-w-sm md:max-w-md sm:hover:bg-slate-1000"
        @click="goToUserProfile(notification.userName)">
        <div class="flex-inital flex-none">
            <ProfileAvatar :src="notification.profilePictureUrl" :size="56" />
        </div>

        <div class="flex flex-inital flex-row space-x-2">

            <span class="font-sans text-sm sm:text-md font-semibold text-white self-start">
                {{ notification.userName }}
            </span>

            <div class="font-sans text-sm sm:text-md font-semibold text-gray-300 text-ellipsis overflow-hidden self-start">
                {{ notification.caption }}
            </div>

        </div>

        <TheButton 
            :size="'sm'"
            @click="handleClick">
            <span class="sm:text-md sm:font-semibold">
                {{ buttionTitle }}
            </span>
        </TheButton>
        
    </div>
</template>

<script setup lang="ts">
import {
    type PropType,
    computed
} from 'vue'
import ProfileAvatar from '../basics/ProfileAvatar.vue'

import {
    type NotificationCard,
    goToUserProfile
} from '@/common'

import {
    TheButton
} from '@/components'

const prop = defineProps({
    notification: {
        type: Object as PropType<NotificationCard>,
        required: true
    }
})

const emit = defineEmits([
    'follow',
    'unfollow'
])

const emitFollow = (userName: NotificationCard['userName']) => {
    emit('follow', userName)
}

const emitUnfollow = (userName: NotificationCard['userName']) => {
    emit('unfollow', userName)
}

const handleClick = () => {
    prop.notification.isFollowing ? emitUnfollow(prop.notification.userName) : emitFollow(prop.notification.userName)
}

const buttionTitle = computed(() => {
    return prop.notification.isFollowing ? 'Unfollow' : 'Follow'
})
</script>
