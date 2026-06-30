<template>
  <div class="min-h-screen bg-black text-white">
    <div
      v-if="isAppLoading"
      class="fixed inset-0 z-100 flex items-center justify-center bg-black/95"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-[#262626] border-t-[#0095f6]"></div>
        <div class="text-[11px] uppercase tracking-[0.35em] text-[#8e8e8e]">Carregando</div>
      </div>
    </div>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'

const isBooting = ref(true)
const isNavigating = ref(false)
const router = useRouter()

const isAppLoading = computed(() => isBooting.value || isNavigating.value)

router.beforeEach((to, from, next) => {
  if (!isBooting.value) {
    isNavigating.value = true
  }
  next()
})

router.afterEach(() => {
  isNavigating.value = false
})

onMounted(async () => {
  await router.isReady()
  isBooting.value = false
})
</script>
