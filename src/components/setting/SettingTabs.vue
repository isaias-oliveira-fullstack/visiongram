<template>
  <div class="flex flex-col gap-1 px-3 py-4">
    <button class="rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-3 text-left text-[14px] font-semibold text-white transition hover:bg-[#202020]" @click="$emit('edit-profile')">
      Editar perfil
    </button>

    <button v-for="setting in settings" :key="setting" class="cursor-not-allowed rounded-xl px-4 py-3 text-left text-[14px] text-[#a8a8a8] transition hover:bg-[#161616]">
      {{ setting }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits(['edit-profile'])

const settings = [
    'Preferências de idioma',
    'Aplicativos e sites',
    'Notificações por e-mail',
    'Notificações push',
    'O que você pode ver',
    'Como outras pessoas podem interagir com seu conteúdo',
    'Supervisão',
    'Ajuda'
]
</script>