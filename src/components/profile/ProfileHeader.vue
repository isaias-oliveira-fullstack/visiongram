<template>
  <div class="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
    <div class="flex justify-center md:justify-start">
      <ProfileAvatar :src="user.profilePictureUrl" :size="144" />
    </div>

    <div class="flex-1">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-col">
          <div class="text-[22px] font-light text-white">{{ user.userName }}</div>
          <div v-if="displayName" class="text-[14px] text-[#a8a8a8]">{{ displayName }}</div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button v-if="isOwnProfile" class="rounded-full border border-[#262626] bg-[#121212] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#1b1b1b]" @click="goToSettings">
            Editar perfil
          </button>
          <button v-if="!isOwnProfile" class="rounded-full border border-[#262626] bg-[#121212] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#1b1b1b]" @click="sendMessage">
            Mensagem
          </button>
          <button v-if="!isOwnProfile" class="rounded-full bg-[#0095f6] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#1877f2]" @click="toggleFollow">
            {{ isFollowing ? 'Seguindo' : 'Seguir' }}
          </button>
        </div>
      </div>

      <div class="mt-4 hidden md:block">
        <ProfileStats :user="user" :post-count="postCount" @open-modal="$emit('open-modal', $event)" />
      </div>

      <div v-if="user.biography" class="mt-4 max-w-2xl text-[14px] leading-6 text-[#f5f5f5]">
        <p>{{ user.biography }}</p>
      </div>
    </div>
  </div>

  <ProfileStatsMobile :user="user" :post-count="postCount" @open-modal="$emit('open-modal', $event)" />
</template>

<script setup lang="ts">
import {
    computed,
    type PropType
} from 'vue'

import type {
    User
} from '@/common'

import {
    ProfileStats,
    ProfileStatsMobile,
    ProfileAvatar
} from '@/components'

import { useRouter } from 'vue-router'

const props = defineProps({
    user: {
        type: Object as PropType<User>,
        required: true
    },
    postCount: {
        type: Number,
        required: false,
        default: 0
    },
    isOwnProfile: {
        type: Boolean,
        required: false,
        default: false
    },
    isFollowing: {
        type: Boolean,
        required: false,
        default: false
    }
})

const emit = defineEmits(['open-modal', 'toggle-follow', 'send-message'])
const router = useRouter()

const displayName = computed(() => {
    const firstName = props.user.firstName?.trim()
    const lastName = props.user.lastName?.trim()

    if (firstName && lastName) {
        return `${firstName} ${lastName}`
    }

    return firstName || lastName || ''
})

const toggleFollow = () => {
    emit('toggle-follow')
}

const sendMessage = () => {
    emit('send-message')
}

const goToSettings = () => {
    router.push({ path: '/settings' })
}
</script>