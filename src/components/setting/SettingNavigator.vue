<template>
  <div
    :class="{
      'hidden': isMobileScreen && activeSettingTab !== null,
    }"
    class="flex min-w-65 flex-col border-r border-[#262626] bg-[#000000]/30"
  >
    <SettingInfo />
    <SettingTabs @edit-profile="$emit('edit-profile')" />
  </div>
</template>

<script setup lang="ts">
import {
    SettingInfo,
    SettingTabs
} from '@/components'

defineProps({
    isMobileScreen: {
        type: Boolean,
        required: true
    },
    activeSettingTab: {
        type: String as () => string | null
    }
})

defineEmits(['edit-profile'])
</script>