<template>
  <div class="mx-auto w-full max-w-243.75 px-3 py-3 sm:px-4 sm:py-6">
    <div class="flex h-full flex-col overflow-hidden rounded-2xl border border-[#262626] bg-[#121212]">
      <NotificationsHeader />

      <NotificationFeed
        :is-loading="isNotificationsLoading"
        :is-empty="isNotificationsEmpty"
        :notifications="notifications"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
    PropType,
} from 'vue'

import {
    NotificationsHeader,
    NotificationFeed
} from '@/components'

import type {
    NotificationCard as NotificationResult,
} from '@/common'


defineProps({
    notifications: {
        type: Array as PropType <NotificationResult[] | undefined> ,
        required: true
    },
    isNotificationsLoading: Boolean,
    isNotificationsEmpty: Boolean
})

</script>