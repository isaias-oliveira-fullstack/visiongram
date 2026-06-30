<template>
  <div class="fixed inset-x-0 top-0 z-50 flex items-center gap-2 border-b border-[#262626] bg-[#000000]/95 px-3 py-2 sm:hidden backdrop-blur-md">
    <input
      class="h-10 w-full rounded-full border border-[#262626] bg-[#121212] px-4 text-[14px] text-white placeholder:text-[#737373] focus:border-[#3897f0] focus:outline-none"
      placeholder="Pesquisar"
      @focus.prevent="navigateToSearch"
    />
    <button class="text-[14px] font-semibold text-white">Cancelar</button>
  </div>
</template>

<script setup lang="ts">
import {
    useRouter
} from 'vue-router'

const router = useRouter()

const navigateToSearch = () => {
    useRouter().push({name: 'search'})
}
</script>