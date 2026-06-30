<template>
  <div class="sticky bottom-0 z-50 border-t border-[#262626] bg-[#000000]/95 backdrop-blur-md md:hidden">
    <div class="flex items-center justify-around px-2 py-2">
      <router-link
        v-for="item in menuItems"
        :key="item.title"
        :to="item.path"
        class="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[#121212]"
        :class="{ 'bg-[#121212]': item.path === activeNavBar }"
        @click="updateActiveNavBar(item.path)"
      >
        <ProfileAvatar v-if="item.img" :src="item.img" :size="24" class="group-hover:scale-110" />
        <SVGLoader v-else-if="item.iconSvgName" :icon="item.iconSvgName" class="group-hover:scale-110" />
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import {
    defineComponent,
    ref,
    onMounted,
    computed
} from 'vue'

import { 
    useRoute 
} from 'vue-router'

import {
    SVGLoader
} from '@/components'
import ProfileAvatar from '../basics/ProfileAvatar.vue'
import { DEFAULT_PROFILE_PICTURE } from '@/common/constants'

import {
    useAuthStore
} from '@/stores'

import type { 
    NavBarItem 
} from '@/common'

export default defineComponent({
    name: 'BottomNavBar',
    components: {
        SVGLoader,
        ProfileAvatar
    },
    setup() {

        const activeNavBar = ref<NavBarItem['path']>()
        const route = useRoute()
        const authStore = useAuthStore()

        const profilePath = computed(() => {
            return authStore.user?.userName ? `/profile/${authStore.user.userName}` : '/profile'
        })

        const updateActiveNavBar = (navBarTab: NavBarItem['path']) => {
            activeNavBar.value = navBarTab
        }

        const menuItems: NavBarItem[] = [
            {
                title: 'home',
                path: '/home',
                customClass: 'group-hover:scale-110',
                iconSvgName: 'home'
            },
            {
                title: 'explore',
                path: '/explore',
                customClass: 'group-hover:scale-110',
                iconSvgName: 'mobile-explore'
            },
            {
                title: 'reels',
                path: '/reels',
                customClass: 'group-hover:scale-110',
                iconSvgName: 'reels'
            },
            {
                title: 'direct',
                path: '/direct',
                customClass: 'group-hover:scale-110',
                iconSvgName: 'direct'
            },
                {
                title: 'Profile',
                path: profilePath.value,
                name: 'profile',
                customClass: '',
                iconSvgName: '',
                img: authStore.user?.profilePictureUrl || DEFAULT_PROFILE_PICTURE,
                onClick: () => {}
            }
        ]

        const routePath = computed(()=> {
            return route.path ? route.path.toString() : ''
        })

        onMounted(() => {
            updateActiveNavBar(routePath.value)
        })

        return {
            menuItems,
            updateActiveNavBar,
            activeNavBar
        }
    }
})
</script>