<template>
  <div class="flex flex-col gap-3 border-b border-[#262626] bg-[#000000]/30 p-5">
    <SVGLoader :icon="'meta'" hidden />

    <div class="text-[16px] font-semibold text-white">Central de contas</div>

    <div class="text-[13px] leading-6 text-[#a8a8a8]">
      Gerencie suas experiências conectadas e as configurações da conta nas tecnologias da Meta.
    </div>

    <div class="flex items-center gap-2 text-[13px] text-[#f5f5f5]">
      <i class="fa-solid fa-user"></i>
      <span>Dados pessoais</span>
    </div>

    <div class="flex items-center gap-2 text-[13px] text-[#f5f5f5]">
      <i class="fa-solid fa-shield"></i>
      <span>Senha e segurança</span>
    </div>

    <div class="flex items-center gap-2 text-[13px] text-[#f5f5f5]">
      <i class="fa-solid fa-newspaper"></i>
      <span>Preferências de anúncios</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
    SVGLoader,
} from '@/components'
</script>