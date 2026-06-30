<template>
	<div 
        :class="isToggledClass"
        class="sticky top-0 flex h-screen flex-col justify-between space-y-4 py-5">
		<div class="flex flex-col">
			<div 
				:class="{ 'xl:justify-start': !isNavBarCollapsed }"
				class="flex cursor-pointer items-center justify-center rounded-2xl p-4">
				<div
					v-if="!isNavBarCollapsed"
					class="hidden pb-2 pt-6 xl:block">
                    <img 
                        class="w-full h-9"
                        src="@/assets/images/logo-branca.png" />
				</div>
				<div 
					:class="isNavBarCollapsed ? 'block pt-5' : 'block xl:hidden'">
					<SVGLoader :icon="'instagram-small'" />
				</div>
			</div>

			<div class="flex flex-col space-y-1 px-2 py-3">
				<div 
					v-for="item in menuItems"
					:key="item.name"
					@click="updateActiveNavBar(item.name)">
					<router-link
						:to="item.path"
						:class="{ 
							'xl:justify-center': isNavBarCollapsed,
							'bg-[#121212]': item.name === activeNavBar
						}"
						class="group flex cursor-pointer items-center justify-center rounded-full p-3 text-white transition hover:bg-[#121212] xl:justify-start xl:px-4"
						@click="item.onClick">
						<SVGLoader 
							v-if="item.name != 'profile'"
							:icon="item.iconSvgName!" 
							class="group-hover:scale-110 group-active:scale-90" />

                        <ProfileAvatar
                            v-else
                            :src="item.img"
                            :size="24"
                            class="group-hover:scale-110" />

						<span 
							:class="{ 'xl:hidden': isNavBarCollapsed }"
							class="ml-3 hidden text-[15px] font-medium text-white xl:block">
							{{ item.title }}
						</span>
					</router-link>
				</div>
			</div>
		</div>

		<div ref="moreMenuRef" class="relative flex flex-col px-2">
			<div 
				class="flex cursor-pointer items-center justify-center rounded-full border border-[#262626] bg-[#121212] px-4 py-3 transition hover:bg-[#1b1b1b] xl:justify-start"
				@click="toggleMoreModal">
				<SVGLoader :icon="'more'" />
				<span 
					:class="isNavBarCollapsed ? 'xl:hidden block' : 'block'"
					class="ml-3 hidden text-[15px] font-medium text-white xl:block">
					Mais
				</span>
			</div>

			<div v-if="isMoreModalOpen" class="absolute bottom-full left-1/2 z-50 mb-3 min-w-55 -translate-x-1/2 space-y-2 rounded-2xl border border-[#262626] bg-[#121212] p-2 shadow-2xl backdrop-blur-sm">
				<div class="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border border-[#262626] bg-[#121212]"></div>
				<div 
					v-for="(setting, index) in settings"
					:key="index"
					class="flex w-full cursor-pointer items-center space-x-3 rounded-full px-3 py-2 transition hover:bg-[#1b1b1b]"
					@click="setting.action()">

					<i :class="setting.iconSvgName" class="self-end text-white"></i>
					<span class="text-sm font-medium text-white">
						{{ setting.name }}
					</span>

				</div>
			</div>
		</div>

	</div>
</template>

<script setup lang="ts">
import {
    onMounted,
    onBeforeUnmount,
    computed,
    ref
} from 'vue'

import {
    useRoute,
    useRouter
} from 'vue-router'

import {
    useToast
} from 'vue-toastification'

import {
    SVGLoader,
    ProfileAvatar
} from '@/components'

import {
    useModalManagerStore,
    usePhotoStore,
    useAuthStore
} from '@/stores'

import {
    type NavBarItem,
	ModalName,
} from '@/common'


const emit = defineEmits([
    'onCreate',
    'onProfileOpen'
])

// Serviços
const router = useRouter()
const route = useRoute() // route reference
const toast = useToast()
const photoStore = usePhotoStore()
const modalStoreManager = useModalManagerStore()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const profileTitle = computed(() => user.value?.userName || 'Profile')
import { DEFAULT_PROFILE_PICTURE } from '@/common/constants'

const profileAvatar = computed(
    () => user.value?.profilePictureUrl || DEFAULT_PROFILE_PICTURE
)
const profilePath = computed(() => user.value?.userName ? `/profile/${user.value.userName}` : '/home')

let windowWidth = ref(window.innerWidth) // Largura atual da janela
const activeNavBar = ref<NavBarItem['name']>()
const isMoreModalOpen = ref(false)
const moreMenuRef = ref<HTMLDivElement | null>(null)

const menuItems = computed<NavBarItem[]>(() => [{
        title: 'Home',
        path: '/home',
        name: 'home',
        customClass: '',
        iconSvgName: 'home',
        onClick: () => {}
    },
    {
        title: 'Buscar',
        path: '/',
        name: 'search',
        customClass: '',
        iconSvgName: 'search',
        onClick: () => router.push('/search')
    },
    {
        title: 'Explorar',
        path: '/explore',
        name: 'explore',
        customClass: '',
        iconSvgName: 'explore',
        onClick: () => {}
    },
    {
        title: 'Reels',
        path: '/reels',
        name: 'reels',
        customClass: '',
        iconSvgName: 'reels',
        onClick: () => {}
    },
    {
        title: 'Mensagens',
        path: '/direct',
        name: 'direct',
        customClass: '',
        iconSvgName: 'direct',
        onClick: () => {}
    },
    {
        title: 'Notificações',
        path: '/notifications',
        name: 'notifications',
        customClass: '',
        iconSvgName: 'notifications',
        onClick: () => {}
    },
    {
        title: 'Criar',
        path: '/create',
        name: 'create',
        customClass: '',
        iconSvgName: 'create',
        onClick: () => triggerPhotoModal()
    },
    {
        title: profileTitle.value,
        path: profilePath.value,
        name: 'profile',
        customClass: '',
        iconSvgName: '',
        img: profileAvatar.value,
        onClick: () => {
            if (user.value?.userName?.trim()) {
                router.push({ name: 'profile', params: { username: user.value.userName.trim() } })
            } else {
                router.push({ name: 'home' })
            }
        }
    }
])


const settings = [{
        name: 'Configurações',
        iconSvgName: 'fa-solid fa-gear',
        action: () => router.push('/settings')
    },
    {
        name: 'Sua atividade',
        iconSvgName: 'fa-solid fa-clock-rotate-left',
        action: () => router.push('/settings')
    },
    {
        name: 'Salvos',
        iconSvgName: 'fa-regular fa-bookmark',
        action: () => {}
    },
    {
        name: 'Alternar aparência',
        iconSvgName: 'fa-solid fa-moon',
        action: () => {}
    },
    {
        name: 'Reportar um problema',
        iconSvgName: 'fa-solid fa-triangle-exclamation',
        action: () => router.push('/settings')
    },
    {
        name: 'Trocar conta',
        iconSvgName: 'fa-solid fa-user-circle',
        action: () => {}
    },
    {
        name: 'Sair',
        iconSvgName: 'fa-solid fa-sign-out',
        action: () => logout()
    }
]

// Routes with collapsed sidenavbar
const collapsedHiddenRoutes = ['direct']

// Métodos
const toggleMoreModal = () => {
    isMoreModalOpen.value = !isMoreModalOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
    if (moreMenuRef.value && !moreMenuRef.value.contains(event.target as Node)) {
        isMoreModalOpen.value = false
    }
}

const handleSettingAction = (action: () => void) => {
    action()
    isMoreModalOpen.value = false
}

const logout = () => {
    authStore.logout()
    toast.success('Logout realizado com sucesso')
    router.push({ name: 'login' })
}

// Computed
const routeName = computed(() => {
    return route.name ? route.name.toString() : ''
})

const isNavBarCollapsed = computed(() => {
    return collapsedHiddenRoutes.includes(routeName.value)
})

const updateActiveNavBar = (navBarTab: NavBarItem['name']) => {
    activeNavBar.value = navBarTab
}

/**
 * Abre o modal de criação de foto
 */
const triggerPhotoModal = () => {
	onOpenPhotoModal()
    // photoModal.value.isToggled = !photoModal.value.isToggled
}


const onOpenPhotoModal = () => {
	modalStoreManager.toggleModal(ModalName.PHOTO)
}


const isToggledClass = computed(() => {
    return modalStoreManager.isAnyModalOpen ? 'lights-off' : ''
})

onMounted(() => {
	updateActiveNavBar(routeName.value)
	document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
	document.removeEventListener('click', handleClickOutside)
})
</script>