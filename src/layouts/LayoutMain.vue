<template>
  <div class="min-h-screen bg-[#000000] text-white">
    <TopNavBar v-if="!isTopNavBarHidden" />

    <div class="mx-auto flex min-h-screen w-full max-w-315 px-0 lg:px-4 xl:px-6" :class="isModalToggledClass">
      <aside
        v-if="!isSideNavBarHidden"
        class="sticky top-0 hidden h-screen shrink-0 border-r border-[#262626] bg-[#000000] lg:flex"
        :class="isNavBarCollapsed"
      >
        <SideNavBar />
      </aside>

      <main class="flex-1 min-w-0 pb-16 md:pb-0">
        <RouterView />
      </main>
    </div>

    <BottomNavBar v-if="!isBottomNavBarHidden" />
    <Modals />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { TopNavBar, BottomNavBar, SideNavBar, Modals } from '@/components'
import { useModalManagerStore } from '@/stores'

const topNavBarHiddenRoutes = ['style', 'stories', 'direct', 'reels', 'explore']
const bottomNavBarHiddenRoutes = ['stories', 'style', 'direct']
const sideNavBarHiddenRoutes = ['stories']
const collapsedHiddenRoutes = ['direct']

const route = useRoute()
const modalStoreManager = useModalManagerStore()

const routeName = computed(() => (route.name ? route.name.toString() : ''))

const isModalToggledClass = computed(() =>
  modalStoreManager.isAnyModalOpen && modalStoreManager.shouldBlur ? 'lights-off' : ''
)

watch(
  () => modalStoreManager.isAnyModalOpen,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

const isNavBarCollapsed = computed(() =>
  collapsedHiddenRoutes.includes(routeName.value) ? 'w-[72px]' : 'w-[244px]'
)

const isSideNavBarHidden = computed(() => sideNavBarHiddenRoutes.includes(routeName.value))
const isBottomNavBarHidden = computed(() => bottomNavBarHiddenRoutes.includes(routeName.value))
const isTopNavBarHidden = computed(() => topNavBarHiddenRoutes.includes(routeName.value))
</script>