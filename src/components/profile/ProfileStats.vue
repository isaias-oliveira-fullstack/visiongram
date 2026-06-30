<template>
  <div class="flex flex-col gap-4 md:pl-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div></div>

      <div v-if="!hideControls()" class="flex flex-wrap items-center gap-2">
        <button class="rounded-full border border-[#262626] bg-[#121212] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#1b1b1b]" @click="goToSettingsRoute">
          Editar perfil
        </button>
        <button class="rounded-full border border-[#262626] bg-[#121212] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#1b1b1b]">
          Ver arquivados
        </button>
      </div>

      <div v-if="!hideControls()" class="hidden md:block">
        <SVGLoader :icon="'profile-options'" class="cursor-pointer" @click="toggleSettingModal" />
      </div>
    </div>

    <div class="hidden md:block">
      <div class="flex items-center gap-8">
        <div v-for="(stats, index) of userProfileStats" :key="index" class="flex items-center gap-2 text-[14px] text-[#a8a8a8] hover:cursor-pointer" @click="stats.action">
          <span class="font-semibold text-white">{{ stats.count }}</span>
          <span class="capitalize">{{ stats.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type{
	PropType
} from 'vue'

import {
	computed
} from 'vue'

import {
	useRoute,
    useRouter
} from 'vue-router'

import {
    TheButton,
    SVGLoader,
} from '@/components'

import {
    ModalName,
    type User,
} from '@/common'

const prop = defineProps({
    user: {
        type: Object as PropType<User> ,
        required: true
    },
    postCount: {
        type: Number,
        required: false,
        default: 0
    }
})

const emit = defineEmits(['openModal'])

const displayName = computed(() => {
    const firstName = prop.user.firstName?.trim()
    const lastName = prop.user.lastName?.trim()

    if (firstName && lastName) {
        return `${firstName} ${lastName}`
    }

    return firstName || lastName || ''
})

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

// Services
const router = useRouter()
const route = useRoute()

// Métodos
/**
 * Navega para a rota de configurações
 */
const goToSettingsRoute = () => {
    router.push({
        name: 'settings'
    })
}

const toggleSettingModal = () => {
	emit('openModal', {
		modalType: ModalName.PROFILE_SETTING,
		modalTitle: ModalName.PROFILE_SETTING
	})
}

/**
 * Maneira simples de esconder os controles quando o usuário não é o dono do perfil
 * TODO: Remover isso quando o backend estiver pronto
 */
const hideControls = () => {
	return Number(route.query.isSelf) === 1 ? false : true
}

/**
 * Emite um evento de modal para abrir um modal
 * @param modalType O tipo de modal a abrir (Seguidores, Configurações, etc.)
 * @param modalTitle O título do modal a abrir (Seguidores, Seguindo, etc.)
 */
const emitModal = (modalType: string, modalTitle: string) => {
    emit('openModal', {
        modalType,
        modalTitle
    })
}
</script>