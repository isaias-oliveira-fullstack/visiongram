<template>
  <div class="mt-3 border-t border-[#262626] pt-3 md:hidden">
    <ul class="flex items-center justify-around gap-3 px-2">
      <li v-for="(element, index) of userProfileStats" :key="index" class="flex flex-col items-center gap-1 cursor-pointer" @click="element.action">
        <span class="text-[14px] font-semibold text-white">{{ element.count }}</span>
        <span class="text-[12px] uppercase tracking-widest text-[#a8a8a8]">{{ element.title }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type {
    PropType
} from 'vue'

import {
    computed
} from 'vue'

import {
    ModalName,
    type User,
} from '@/common'

const prop = defineProps({
    user: {
        type: Object as PropType<User>,
        required: true
    },
    postCount: {
        type: Number,
        required: false,
        default: 0
    }
})

const emit = defineEmits(['openModal'])

const userProfileStats = computed(() => [{
        title: 'publicações',
        count: prop.postCount ?? prop.user.mediaItems.length,
        action: () => {},
    },
    {
        title: 'seguidores',
        count: prop.user.followerCount,
        action: () => emitModal(ModalName.FOLLOW, 'Seguidores'),
    },
    {
        title: 'seguindo',
        count: prop.user.followingCount,
        action: () => emitModal(ModalName.FOLLOW, 'Seguindo'),
    }
])

/**
 *  Emits a modal event to open a modal
 * @param modalType The type of modal to open (Follow, Settings, etc.)
 * @param modalTitle The title of the modal to open (Followers, Following, etc.)
 */
const emitModal = (modalType: string, modalTitle: string) => {
    emit('openModal', {
        modalType,
        modalTitle
    })
}
</script>