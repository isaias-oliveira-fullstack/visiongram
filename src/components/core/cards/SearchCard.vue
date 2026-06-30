<template>
    <div 
        class="rounded-lg flex items-center space-x-2 w-full p-2 h-12 cursor-pointer"
        @click="handleSelect(searchResult.userName)">
        <div class="flex-inital flex-none">
            <ProfileAvatar :src="searchResult.profilePictureUrl" :size="56" />
        </div>

        <div class="flex flex-inital flex-col">

            <span class="font-sans text-sm font-semibold text-white self-start">
                {{ searchResult.userName }}
            </span>
            
            <div class="font-sans text-xs font-semibold text-gray-400 text-ellipsis overflow-hidden self-start">
                {{ searchResult.bio }}
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import type { 
    PropType 
} from 'vue'
import ProfileAvatar from '../basics/ProfileAvatar.vue'

import type {
    SearchCard
} from '@/common'

import router from '@/router'

defineProps({
    searchResult: {
        type: Object as PropType<SearchCard>,
        required: true
    }
})

const emit = defineEmits(['onSelect'])

const goToUserProfile = (userName: string) => {
    router.push({ name: 'profile', params: { username: userName } })
}

const handleSelect = (userName: string) => {
    emit('onSelect', userName)
    goToUserProfile(userName)
}
</script>
