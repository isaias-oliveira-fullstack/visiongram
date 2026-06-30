<template>
  <div v-show="emptyTabBarBodyMessage.isEmpty" class="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#262626] bg-[#000000]/30 px-6 py-16 text-center">
    <i class="pb-2 text-5xl text-[#a8a8a8]" :class="emptyTabBarBodyMessage.icon"></i>

    <div class="flex flex-col gap-2">
      <span class="text-[22px] font-light text-white">{{ emptyTabBarBodyMessage.top }}</span>
      <span class="text-[14px] text-[#a8a8a8]">{{ emptyTabBarBodyMessage.body }}</span>
      <span class="text-[14px] font-semibold text-[#0095f6]">{{ emptyTabBarBodyMessage.footer }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
    type PropType,
    computed,
} from 'vue'

import {
    type NavBarTabs,
    ProfileTab
} from '@/common'

const prop = defineProps({
    currentActiveTab: {
        type: String as PropType<NavBarTabs>,
        required: true
    },
    isSavedTabEmpty: {
        type: Boolean as PropType<boolean>,
        required: true
    },
    isTaggedTabEmpty: {
        type: Boolean as PropType<boolean>,
        required: true
    },
    isPostTabEmpty: {
        type: Boolean as PropType<boolean>,
        required: true
    },
    isPeedTabEmpty: {
        type: Boolean as PropType<boolean>,
        required: true
    }
})

/**
 * Retorna a mensagem com base na aba ativa para o corpo vazio da barra de abas
 */
const emptyTabBarBodyMessage = computed(() => {
    switch (prop.currentActiveTab) {
        case ProfileTab.Posts:
            return {
                icon: 'fa-solid fa-photo-film',
                top: 'Compartilhe fotos',
                body: 'Quando você compartilha fotos, elas aparecem no seu perfil.',
                footer: 'Compartilhe sua primeira foto',
                isEmpty: prop.isPostTabEmpty
            }
        case ProfileTab.Peeds:
            return {
                icon: 'fa-solid fa-photo-film',
                top: 'Compartilhe fotos',
                body: 'Quando você compartilha fotos, elas aparecem no seu perfil.',
                footer: 'Compartilhe sua primeira foto',
                isEmpty: prop.isPeedTabEmpty
            }
        case ProfileTab.Tagged:
            return {
                icon: 'fa-solid fa-users-viewfinder',
                    top: 'Comece a salvar',
                    body: 'Salve fotos e vídeos na sua coleção.',
                    footer: 'Adicionar à coleção',
                    isEmpty: prop.isTaggedTabEmpty

            }
        case ProfileTab.Saved:
            return {
                icon: 'fa-regular fa-bookmark',
                    top: 'Nenhuma publicação salva',
                    body: 'Salve fotos e vídeos na sua coleção.',
                    footer: 'Comece a salvar',
                    isEmpty: prop.isSavedTabEmpty
            }
        default:
            return {}
    }
})
</script>