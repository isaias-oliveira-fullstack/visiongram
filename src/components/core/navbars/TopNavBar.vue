<template>
  <div class="sticky top-0 z-50 border-b border-[#262626] bg-[#000000]/95 backdrop-blur-md md:hidden">
    <div class="flex items-center justify-between px-4 py-3">
      <button class="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#121212]" @click="routeName !== 'home' ? onPageBack() : undefined">
        <span v-if="routeName !== 'home'" class="rotate-270">
          <SVGLoader :icon="'back-arrow'" />
        </span>
        <img v-else class="h-7 w-24" src="@/assets/images/icon-dark.png" alt="Instagram" />
      </button>

      <div v-if="routeName === 'home'" class="flex items-center gap-1">
        <button class="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#121212]" @click="onToggle">
          <SVGLoader :icon="'create'" />
        </button>
        <router-link to="/notifications" class="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#121212]">
          <SVGLoader :icon="'like'" />
        </router-link>
      </div>

      <div v-else class="flex-1 text-center text-[15px] font-semibold text-white">
        <span class="capitalize">{{ routeName }}</span>
      </div>
    </div>
  </div>

  <Transition>
    <div v-show="isDropDownTriggered" class="absolute right-3 top-14 z-50 w-36 rounded-2xl border border-[#262626] bg-[#121212] p-2 shadow-2xl">
      <button class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-white transition hover:bg-[#1b1b1b]" @click="onToggle">
        <span>Publicar</span>
        <SVGLoader :icon="'create-small'" />
      </button>
      <button class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-white transition hover:bg-[#1b1b1b]" @click="unsupportedFeature">
        <span>História</span>
        <SVGLoader :icon="'new-story-small'" />
      </button>
    </div>
  </Transition>
</template>

<script lang="ts">
import { onMounted, defineComponent, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
    SVGLoader
} from '@/components'

import { 
    usePhotoStore 
} from '@/stores'
import { useToast } from 'vue-toastification'

// import type { 
//     NavBarItem 
// } from '@/common'

export default defineComponent({
    name: 'TopNavBar',
    components: {
        SVGLoader
    },
    emits: [
        'onToggle',
    ],
    setup(props, context) {

        // Verificadores de estado
        const isDropDownTriggered = ref<boolean>(false)

        const triggerDropDown = () => {
            isDropDownTriggered.value = !isDropDownTriggered.value
        }
        

        // Serviços
        const route = useRoute()
        const router = useRouter()
        const photoStore = usePhotoStore()
        const toast = useToast()

        /**
         * Altera o estado do store para abrir o diálogo de upload de arquivo
         */
         const onToggle = () => {
            photoStore.isFileUploadDialogOpen = !photoStore.isFileUploadDialogOpen
        }

        const unsupportedFeature = () => {
            toast.warning('Este recurso ainda não é suportado')
        }

         const onPageBack= () => {
            // Clona a estrutura do histórico para evitar mutações
            const historyCount = structuredClone(window.history.length)

            setTimeout(() => {
                /**
                 * Forma econômica de verificar se o usuário vem de outro website
                 * Usuários chegando de outro website têm um valor maior que 0
                 * Queremos redirecioná-los para a página inicial
                 * Caso contrário, queremos voltar para a página anterior
                 * https://stackoverflow.com/questions/62358716/check-if-there-is-a-previous-page-in-vue-route
                 */
                if (historyCount > 0) {
                    router.push('/home')
                } else {
                    router.back()
                }
            }, 1000)
        }

        // Computados
        const routeName = computed(()=> {
            switch (route.name) {
                case 'profile':
                    return route.params.username ? route.params.username : route.name.toString()
                default:
                    return route.name ? route.name.toString() : ''
            }
        })

        onMounted(() => {
        })


        return {
            routeName,
            isDropDownTriggered,
            triggerDropDown,
            unsupportedFeature,
            onPageBack,
            onToggle
        }
    }
})
</script>