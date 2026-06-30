<template>
  <div class="flex flex-col gap-4" @click="goToUserProfile(cardItem.userName)">
    <div class="flex items-center justify-between rounded-2xl border border-[#262626] bg-[#121212] px-4 py-3">
      <button class="flex items-center gap-3" @click.stop="goToUserProfile(cardItem.userName)">
        <ProfileAvatar :src="cardItem.profilePictureUrl" :size="44" />
        <div class="flex flex-col">
          <span class="text-[14px] font-semibold text-white">{{ cardItem.userName }}</span>
          <span class="text-[12px] text-[#a8a8a8]">Sugestões para você</span>
        </div>
      </button>
      <button class="text-[12px] font-semibold text-[#0095f6] transition hover:text-white">Trocar</button>
    </div>

    <div class="rounded-2xl border border-[#262626] bg-[#121212] p-4">
      <div class="mb-3 flex items-center justify-between">
        <span class="text-[14px] font-semibold text-[#f5f5f5]">Sugestões para você</span>
        <button class="text-[12px] font-semibold text-white/80 transition hover:text-white">Ver tudo</button>
      </div>

      <div v-for="(suggest, index) of cardItem.suggested" :key="suggest.id ?? index" class="flex items-center justify-between py-2.5">
        <button class="flex flex-1 items-center gap-3 text-left" @click.stop="goToUserProfile(suggest.userName)">
          <ProfileAvatar :src="suggest.profilePictureUrl" :size="32" />
          <div class="min-w-0">
            <div class="truncate text-[14px] font-semibold text-white">{{ suggest.userName }}</div>
            <div class="truncate text-[12px] text-[#a8a8a8]">Seguido por {{ suggest.followedBy }}</div>
          </div>
        </button>

        <button class="text-[12px] font-semibold text-[#0095f6] transition hover:text-white" @click.prevent="toggleFollow(suggest.id)">
          {{ suggest.isFollowing ? 'Seguindo' : 'Seguir' }}
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 text-[12px] font-medium text-[#737373]">
      <span>Sobre</span>
      <span>Ajuda</span>
      <span>Imprensa</span>
      <span>API</span>
      <span>Carreiras</span>
      <span>Privacidade</span>
      <span>Termos</span>
      <span>Locais</span>
      <span>Idioma</span>
    </div>

    <div class="text-[12px] font-medium text-[#737373]">© 2026 VISIONGRAM</div>
  </div>
</template>

<script setup lang="ts">
import { 
    goToUserProfile, 
    type SuggestionCard 
} from '@/common'
import ProfileAvatar from '../basics/ProfileAvatar.vue'

defineProps({
    cardItem: {
        type: Object as () => SuggestionCard,
        required: true
    }
})

const emit = defineEmits(['followToggle'])

const toggleFollow = (profileId?: string) => {
  emit('followToggle', profileId)
}
</script>