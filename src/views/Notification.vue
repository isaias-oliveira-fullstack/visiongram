<template>
	<NotificationPanel 
		:notifications="notifications"
		:is-notifications-loading="isNotificationsLoading"
		:is-notifications-empty="isNotificationsEmpty" />
</template>
	
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NotificationPanel } from '@/components'
import type { NotificationCard as NotificationResult } from '@/common'
import { useNotificationStore } from '@/stores'

const store = useNotificationStore()
const notifications = ref<NotificationResult[]>([])
const isNotificationsLoading = computed(() => store.isLoading)
const isNotificationsEmpty = computed(() => store.notifications.length === 0)

onMounted(() => {
	store.fetchNotifications().then(() => {
		notifications.value = store.notifications
	}).catch(() => {})
})

</script>