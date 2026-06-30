<template>
  <div :class="['inline-block', wrapperClass]" :style="wrapperStyle">
    <img
      :src="currentSrc"
      :alt="alt"
      :class="imgClass"
      draggable="false"
      @error="handleImageError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DEFAULT_PROFILE_PICTURE } from '@/common/constants'

const props = defineProps({
  src: { type: String, default: '' },
  size: { type: [Number, String], default: 40 },
  alt: { type: String, default: 'profile avatar' },
  class: { type: String, default: '' }
})

const errored = ref(false)

const currentSrc = computed(() => {
  if (errored.value) return DEFAULT_PROFILE_PICTURE
  const s = (props.src ?? '').toString().trim()
  if (!s) return DEFAULT_PROFILE_PICTURE
  return s
})

const handleImageError = () => {
  errored.value = true
}

const sizePx = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
const wrapperStyle = computed(() => ({ width: sizePx.value, height: sizePx.value }))
const wrapperClass = computed(() => `rounded-full overflow-hidden`) 
const imgClass = computed(() => `w-full h-full object-cover ${props.class}`)
</script>

<style scoped>
img { display: block; }
</style>
