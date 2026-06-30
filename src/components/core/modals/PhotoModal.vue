<template>
  <div
    v-if="isModalToggled"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
  >
    <div
      id="photo-modal"
      class="relative w-full max-w-245 max-h-[calc(100vh-4rem)] overflow-hidden rounded-4xl bg-black shadow-2xl border border-slate-800"
      :class="{
        'opacity-100': isModalToggled
      }"
    >
        <div class="min-h-140 max-h-[calc(100vh-4rem)] overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between border-b border-slate-700 px-4 py-3">
                    <span class="w-8">
                        <button
                            type="button"
                            class="text-slate-300 hover:text-white transition"
                            @click="currentModalStage === PhotoStage.CreatePost ? onModalClosed() : updateModalStage(returnButtonAction)">
                            <SVGLoader :icon="currentModalStage === PhotoStage.CreatePost ? 'cross-large' : 'media-back-arrow'" />
                        </button>
                    </span>

                    <span class="font-sans text-base font-semibold text-white text-center">
                        {{ largeModalHeaderName }}
                    </span>

                    <span class="w-24 text-right">
                        <button
                            v-if="isFileUploaded && isFileValid && currentModalStage === PhotoStage.EditPostAdjustments"
                            type="button"
                            class="text-sm font-semibold text-sky-500 hover:text-white transition"
                            @click="updateModalStage(PhotoStage.EditPostForm)">
                            Próximo
                        </button>
                        <button
                            v-else-if="currentModalStage === PhotoStage.EditPostForm"
                            type="button"
                            class="text-sm font-semibold text-sky-500 hover:text-white transition"
                            @click="updateModalStage(PhotoStage.SharingPost)">
                            Compartilhar
                        </button>
                    </span>
                </div>

                <div class="relative flex flex-col lg:flex-row min-h-130 max-h-full overflow-hidden">
                    <!-- Body -->
                    <div 
                        class="relative flex-1 bg-black border-b border-slate-800 lg:border-b-0 lg:border-r overflow-hidden"
                        :class="{ 
                            'p-12': !previewImage,
                            'p-0': previewImage
                            }">

                            <!-- Upload Form -->
                            <div 
                                v-if="currentModalStage === PhotoStage.CreatePost"
                                class="flex flex-col place-self-center space-y-4">

                                <SVGLoader 
                                    :icon="'media-modal'" 
                                    :class="'mx-auto'"/>

                                <span 
                                    class="font-sans lg:text-xl sm:text-lg text-md 
                                    text-white md:font-semibold mx-auto">
                                    Arraste fotos e vídeos aqui
                                </span>

                                <button  
                                    type="button"
                                    class="w-auto mx-auto font-semibold text-sm 
                                    text-white bg-[#0095f6] sm:hover:bg-sky-700 rounded-lg 
                                    lg:px-3 lg:py-1.5 px-3 py-1.5 lg:w-auto" 
                                    @click="triggerFileUpload">
                                    Selecionar do computador
                                </button>

                                <input
                                    ref="fileUpload"
                                    accept="image/*,video/*"
                                    type='file'
                                    hidden @change="onFileUpload"/>
                                    
                            </div>

                            <!-- Uploaded Media Preview -->
                            <template v-else-if="previewImage && editStages.includes(currentModalStage)">
                                <div class="relative w-full h-full overflow-hidden">
                                    <img
                                        v-if="previewMediaType === 'image'"
                                        :src="previewImage"
                                        :style="!isFilterApplied ? filterStyle : ''"
                                        :class="[imageFilter]"
                                        class="absolute inset-0 h-full w-full object-contain"
                                    />
                                    <video
                                        v-else
                                        :src="previewImage"
                                        class="absolute inset-0 h-full w-full object-contain"
                                        controls
                                        muted
                                        playsinline
                                        loop
                                        autoplay>
                                    </video>
                                </div>
                            </template>

                            <!-- Loading Progress -->
                            <div 
                                v-else-if="currentModalStage === PhotoStage.SharingPost">
                                <img
                                    src="@/assets/gifs/loading.gif"
                                    class="absolute block md:h-24 md:w-24 w-full 
                                    -translate-x-1/2 md:-translate-y-1/2 top-1/2 left-1/2"/>
                            </div>
                            
                            <!-- Loading Completed Successfully -->
                            <div 
                                v-else-if="currentModalStage === PhotoStage.PostShared"
                                class="absolute top-1/2 left-1/2 -translate-x-1/2 
                                translate-y-1/2 lg:-translate-y-1/2 flex flex-col space-y-2">

                                <img
                                    id="theImage"
                                    src="@/assets/gifs/loaded.gif"
                                    class="block md:h-24 md:w-24 self-center"/>

                                <span 
                                    class="md:text-xl text-sm text-center 
                                    font-normal  text-white">
                                    Sua publicação foi compartilhada.
                                </span>

                            </div> 
                    </div>

                    <div class="hidden md:block lg:w-85 max-h-full overflow-y-auto">

                        <div 
                            v-if="currentModalStage === PhotoStage.EditPostAdjustments"
                            class="flex justify-between border-b border-slate-500"
                            :class="largeModalHeaderName != 'Edit' ? 'hidden' : ''">

                            <div
                                class="basis-1/2 font-normal p-3
                                text-center text-sm sm:hover:cursor-pointer 
                                border-b-2 border-gray-300" 
                                :class="currentActiveFilterTab === PhotoTab.FiltersTab ? 'text-white' : 'border-transparent text-gray-500'"
                                @click="filterTabSwitcher(PhotoTab.FiltersTab)">
                                Filters
                            </div>

                            <div 
                                class="basis-1/2 font-normal p-3
                                text-center  text-sm 
                                sm:hover:cursor-pointer
                                border-b-2 border-gray-300" 
                                :class="currentActiveFilterTab === PhotoTab.AdjustmentsTab ? 'text-white' : 'border-transparent text-gray-500'"
                                @click="filterTabSwitcher(PhotoTab.AdjustmentsTab)">
                                Adjustments
                            </div>

                        </div>

                        <!-- Filters Tab -->
                        <div
                            class="flex flex-wrap sm:pl-1.5 pt-3 
                            h-fit md:w-80 justify-around"
                            :class="{
                                'hidden': !isFiltersTabActive,
                                'invisible': currentActiveFilterTab != PhotoTab.FiltersTab}">

                                <!-- Use v-for directive to loop through the filters array -->
                                <div
                                    v-for="filter in filters"
                                    :key="filter.filterName"
                                    class="flex flex-col pt-2 lg:w-22 w-20 
                                    sm:hover:cursor-pointer active:scale-95 
                                    active:brightness-75"
                                    @click="updatePreviewImageFitler(filter.filterName, filter.filterClass)">

                                    <div
                                        :class="{
                                            'border-2 border-sky-500 rounded': activeImageFilter.filterName === filter.filterName
                                        }">

                                        <img
                                            src="@/assets/images/filter.jpg"
                                            class="w-fit rounded"
                                            :class="filter.filterClass"/>

                                    </div>

                                    <span
                                        class="font-sans text-center text-xs"
                                        :class="activeImageFilter.filterName === filter.filterName ? 'text-sky-500' : 'text-gray-500'">

                                        {{ filter.displayName }}
                                        
                                    </span>

                                </div>

                        </div>
                    

                        <!-- Adjustments tab -->
                        <div 
                            class="flex flex-col space-y-4 md:w-80"
                            :class="{
                                'hidden': !isAdjustmentsTabActive,
                            }">

                            <div
                                v-for="adjustment in currentImageAdjustments" 
                                :key="adjustment.label" 
                                class="p-3 py-2 space-y-5">
                                
                                <label class="block mb-2 text-md font-medium text-white">
                                    {{ adjustment.label }}
                                </label>

                                <div 
                                    class="flex justify-between">
                                    
                                    <input
                                        v-model="adjustment.level"
                                        type="range"
                                        max="99"
                                        class="self-center lg:w-64 w-auto h-0.5 bg-white
                                        rounded-lg appearance-none cursor-pointe"/>

                                    <span class="text-xs font-medium text-white">
                                        {{ adjustment.level === 'Normal' ? 50 : adjustment.level }}
                                    </span>

                                </div>

                            </div>

                        </div>

                        <!-- Last tab: Post Form -->
                        <div 
                            class="flex flex-col space-y-4 md:w-80 p-4"
                            :class="{
                                'hidden': currentModalStage != PhotoStage.EditPostForm 
                            }">

                            <!-- Mini User Profile -->
                            <div class="flex flex-inital flex-row text-center space-x-1">

                                <img 
                                    src="@/assets/images/filter.jpg"
                                    class="w-8 h-8 rounded-full"/>
                                
                                <div class="flex pl-1.5 pt-2 space-x-2">

                                    <span class="font-sans text-sm font-semibold text-white self-start">
                                         hot_souce_56
                                    </span>

                                    <span></span>
                                    
                                    <span></span>

                                </div>

                            </div>

                            <!-- Text Area -->
                            <div class="flex flex-col space-y-2">

                                <textarea 
                                    v-model="Imageform.caption"
                                    rows="8"
                                    maxlength="2200"
                                    class="block w-full text-md bg-slate-1100 
                                    text-white focus:outline-none border-none
                                    resize-none placeholder:text-gray-1100"
                                    placeholder="Escreva uma legenda..."></textarea>

                                <div class="flex justify-between">

                                    <div class="text-gray-1100">
                                        <SVGLoader 
                                            :icon="'profile-post-emoji'"/>
                                    </div>

                                    <span class="text-gray-1100 text-xs">
                                       {{ characterCount }}/2,200
                                    </span>

                                </div>

                                <div class="flex justify-between">

                                    <textarea 
                                        v-model="Imageform.location"
                                        rows="1"
                                        maxlength="50"
                                        class="block w-full text-md bg-slate-1100 
                                        text-white focus:outline-none resize-none 
                                        placeholder:text-gray-1100 border-none"
                                    placeholder="Adicionar localização"></textarea>
                
                                    <i class="fa-solid fa-location-dot fa-beat-fade text-white self-center"></i>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>
        </div>
        
    </div>
    <!-- Photo-modal for mobile apps -->
    <div 
        id="photo-modal-mobile" 
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:hidden"
            :class="{ 
                'hidden': !isModalToggled
            }">
            <div class="relative w-full max-w-sm max-h-[calc(100vh-3.5rem)] overflow-hidden rounded-[28px] bg-black border border-slate-800">
        <div 
            class="flex flex-col space-x-2 justify-around 
            border-t border-gray-700 sticky top-0 md:hidden 
            z-50 bg-black border-b">

            <div class="flex space-x-2 justify-between relative">

                <!-- Left Side -->
                <div 
                    class="group cursor-pointer rounded-full 
                    flex space-x-4 sm:hover:bg-slate-1000
                    sm:hover:delay-100 p-3 xl:justify-start justify-center">

                    <!-- Exit Button -->
                    <div
                        class="rotate-270"
                        :class="{'hidden': currentModalStage != PhotoStage.CreatePost}">
                        <SVGLoader 
                            :icon="'cross-large'"
                            :class="'group-hover:scale-110'"
                            @click="refreshPage()"/>
                    </div>

                    <!-- Return Button -->
                    <span 
                        class="rotate-270"
                        :class="{
                            'hidden': currentModalStage === PhotoStage.CreatePost,
                            'invisible': currentModalStage === PhotoStage.SharingPost}"
                        @click="updateModalStage(PhotoStage.CreatePost)">
                        <SVGLoader 
                            :icon="'back-arrow'"
                            :class="'group-hover:scale-110'"/>
                    </span>

                </div>

                <!-- Right Side -->
                <div class="flex px-2">

                    <!-- Button/Stage: Next, Share and Shared -->
                    <span 
                        class="font-sans text-md font-semibold text-sky-500 
                        group flex space-x-4 pt-3 xl:justify-start
                        justify-center justify-self-end cursor-pointer 
                        sm:hover:delay-100 sm:hover:text-white"
                        :class="{'invisible': currentModalStage === PhotoStage.SharingPost}"
                        @click="updateModalStage(currentModalStage === PhotoStage.CreatePost ? PhotoStage.EditPostForm : PhotoStage.SharingPost)">

                        {{ smallModalButtonName }}
                    </span>
                    
                </div>

                    <!-- Current Stage name: New post, Sharing etc -->
                <div    
                    class="font-sans text-md font-semibold 
                    absolute top-1/2 left-1/2 transform 
                    -translate-x-1/2 -translate-y-1/2 ml-12
                    text-white">
                        {{ smallModalHeaderName }}
                </div>
                
            </div>

        </div>

        <!-- Preview & Filters -->
        <div
            :class="{'hidden' : currentModalStage != PhotoStage.CreatePost}"
            class="flex flex-col">

            <!-- Image Preview -->
            <img
                v-if="previewImage"
                :src="previewImage"
                :style="!isFilterApplied ? filterStyle : '' "
                :class="[imageFilter]"
                class="basis-2/4"/>

            <!-- Filters Tab -->
            <div class="p-5 flex flex-row overflow-x-auto space-x-2 pt-2 bg-black">

                <div
                    v-for="filter in filters"
                    :key="filter.filterName"
                    class="flex flex-col space-y-2 flex-none 
                    active:scale-95 active:brightness-75"
                    @click="updatePreviewImageFitler(filter.filterName, filter.filterClass)">

                    <span
                        class="font-sans text-center text-xs pt-1"
                        :class="activeImageFilter.filterName === filter.filterName ? 'text-sky-500' : 'text-gray-500'">

                        {{ filter.displayName }}
                        
                    </span>
                    
                    <div>
                        <img 
                            src="@/assets/images/filter.jpg"
                            :class="filter.filterClass"
                            class="w-24 h-24 rounded"/>
                    </div>

                </div>

            </div>

        </div>

        <!-- Post Form -->
        <div
            v-if="currentModalStage != PhotoStage.CreatePost"
            :class="{
                'brightness-50' : currentModalStage === PhotoStage.SharingPost
            }"
            class="flex flex-col h-5/6 bg-slate-1000 space-y-4">

            <div class="flex space-x-2 py-5 px-2 bg-black">

                
                <img 
                    :src="'https://loremflickr.com/1024/1080/dog'"
                    class="rounded-full h-8 w-8"/>

                <textarea 
                    v-model="Imageform.caption"
                    :disabled="currentModalStage === PhotoStage.SharingPost"
                    rows="2"
                    placeholder="Escreva uma legenda..."
                    maxlength="2200"
                    class="focus:outline-none resize-none 
                    placeholder:text-gray-1100
                    block w-full text-xs bg-black text-white"></textarea>

                <img 
                    v-if="previewImage"
                    :src="previewImage"
                    class="h-12 w-12"/>

            </div>

            <div class="flex justify-between bg-black">

                <textarea 
                    v-model="Imageform.location"
                    :disabled="currentModalStage === PhotoStage.SharingPost"
                    rows="1"
                    maxlength="50"
                    class="focus:outline-none resize-none 
                    placeholder:text-white px-4 py-3 border-t-2 border-b-2 border-gray-800 
                    block w-full text-md bg-black text-white"
                        placeholder="Adicionar local"></textarea>

            </div>

        </div>

    </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ref,
    watch,
    onMounted,
    computed,
} from 'vue'

import {
    useRoute,
    useRouter
} from 'vue-router'
import { useToast } from 'vue-toastification'

import type {
    PhotoModalStage,
    PhotoModalTab,
    PhotoModalImage,
    PhotoModalImageFilter,
    PhotoModalImageForm,
    PhotoModalAdjustment,
    HTMLInputElementRef,
} from '@/common'

import { 
    PhotoTab,
    PhotoStage
 } from "@/common"

import {
    SVGLoader
} from '@/components'

import {
    ModalName
} from '@/common'

import {
    usePhotoStore,
    useModalManagerStore,
    usePostStore
} from '@/stores'

/* Notas internas removidas para prontidão de produção */

const props = defineProps({
    isToggled: {
        type: Boolean,
        required: false,
        default: false
    }
})

const emit = defineEmits([
    'onModalClosed',
    'onFileUpload',
    'onProcessCompleted'
])

// Referências aos elementos do DOM
const fileUpload = ref<HTMLInputElementRef | null>()
const previewImage = ref<PhotoModalImage>(null)
const previewMediaType = ref<'image' | 'video'>('image')
const activeImageFilter = ref<PhotoModalImageFilter>({
    filterName: 'original',
    filterClass: '',
    displayName: 'Original'
})

// Rastreadores
const currentActiveFilterTab = ref<PhotoModalTab>(PhotoTab.FiltersTab)
const currentModalStage = ref<PhotoModalStage>(PhotoStage.CreatePost)

const editStages: PhotoModalStage[] = [PhotoStage.EditPostAdjustments, PhotoStage.EditPostForm]
const nonEditStages: PhotoModalStage[] = [PhotoStage.CreatePost, PhotoStage.SharingPost, 
    PhotoStage.PostShared, PhotoStage.PostFailed
]

// Sinalizadores para rastreamento de upload
const isFileUploaded = ref<boolean>(false)
const isFileValid = ref<boolean>(false)
const isFilterApplied = ref<boolean>(false)

// Outros
let screenWidth = ref<number>(window.innerWidth) // Largura atual da janela
const currentImageAdjustments = ref<PhotoModalAdjustment>({
    brightness: {
        label: 'Brightness',
        level: 0 as number | string
    },
    contrast: {
        label: 'Contrast',
        level: 0 as number | string
    },
    saturation: {
        label: 'Saturation',
        level: 0 as number | string
    },
})
const Imageform = ref<PhotoModalImageForm>({
    caption: '',
    location: ''
})

const defaultImageForm = (): PhotoModalImageForm => ({
    caption: '',
    location: ''
})

const defaultImageFilter = (): PhotoModalImageFilter => ({
    filterName: 'original',
    filterClass: '',
    displayName: 'Original'
})

const defaultImageAdjustments = (): PhotoModalAdjustment => ({
    brightness: {
        label: 'Brightness',
        level: 0 as number | string
    },
    contrast: {
        label: 'Contrast',
        level: 0 as number | string
    },
    saturation: {
        label: 'Saturation',
        level: 0 as number | string
    }
})

const filters: PhotoModalImageFilter[] = [
    {
        filterName: 'original',
        filterClass: '',
        displayName: 'Original'
    },
    {
        filterName: 'slumber',
        filterClass: 'saturate-50',
        displayName: 'Slumber'
    },
    {
        filterName: 'moon',
        filterClass: 'grayscale',
        displayName: 'Moon'
    },
    {
        filterName: 'sepia',
        filterClass: 'sepia',
        displayName: 'Sepia'
    },
    {
        filterName: 'invert',
        filterClass: 'invert',
        displayName: 'Invert'
    },
    {
        filterName: 'juno',
        filterClass: 'contrast-150',
        displayName: 'Juno'
    },
]

// Serviços
const route = useRoute()
const router = useRouter()
const photoStore = usePhotoStore()
const postStore = usePostStore()
const modalStoreManagerStore = useModalManagerStore()
const toast = useToast()
const isShareInProgress = ref(false)


// Métodos
/**
 * Emit signal when the modal is closed
 */
const onModalClosed = () => {
    modalStoreManagerStore.closeModal()
    if (route.name === 'post' && modalStoreManagerStore.getActivePost) {
        modalStoreManagerStore.openModal(ModalName.POST)
    } else {
        modalStoreManagerStore.clearActivePost()
    }
    emit('onModalClosed')
    resetModalState()
}

/**
 * Emite um sinal quando o arquivo for enviado com sucesso
 */
const onSuccessFileUpload = () => {
    emit('onFileUpload')
}

/**
 * Trata o evento de upload de arquivo
 * @param {Object} event - O objeto do evento
 */
    const onFileUpload = (event: Event) => {
    const targetEvent = event.target as HTMLInputElement
    const file = targetEvent?.files?.item(0) as Blob
    if (!file) return

    previewMediaType.value = file.type.startsWith('video') ? 'video' : 'image'

    // Lê o arquivo como data URL para mostrar pré-visualização
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
        previewImage.value = event.target?.result as string
    }
    isFileValid.value = true
    isFileUploaded.value = true
    updateModalStage(PhotoStage.EditPostAdjustments)
}

/**
 * Atualiza o filtro da imagem de pré-visualização
 */
const updatePreviewImageFitler = (filterName: PhotoModalImageFilter['filterName'],
    filterClass: PhotoModalImageFilter['filterClass']) => {
    activeImageFilter.value.filterName = filterName
    activeImageFilter.value.filterClass = filterClass
}

/**
 * Reinicia a imagem de pré-visualização para nulo
 */
const resetPreviewImage = () => {
    previewImage.value = null
}

/**
 * Dispara o evento de upload de arquivo no DOM
 */
const triggerFileUpload = () => {
    fileUpload.value?.click()
}

const filterTabSwitcher = (currentTab: PhotoModalTab) => {
    currentActiveFilterTab.value = currentTab
}

const updateModalStage = (stage: PhotoModalStage) => {
    currentModalStage.value = stage
}

const refreshPage = () => {
    router.go(0)
}

const resetModalStage = () => {
    currentModalStage.value = PhotoStage.CreatePost
}

const resetPhotoModalState = () => {
    previewImage.value = null
    activeImageFilter.value = defaultImageFilter()
    currentImageAdjustments.value = defaultImageAdjustments()
    Imageform.value = defaultImageForm()
    isFileUploaded.value = false
    isFileValid.value = false
    isFilterApplied.value = false
}

const resetModalState = () => {
    modalStoreManagerStore.$reset()
    // Reseta os armazenadores de estado
    photoStore.$reset()
    // Reseta o estado do modal após compartilhamento ou fechamento
    resetPhotoModalState()
    // Reseta o estágio de exibição
    resetModalStage()
}

const sharePost = async () => {
    if (currentModalStage.value !== PhotoStage.SharingPost || isShareInProgress.value) {
        return
    }

    if (!previewImage.value) {
        toast.error('Selecione uma imagem antes de compartilhar')
        currentModalStage.value = PhotoStage.EditPostForm
        return
    }

    isShareInProgress.value = true

    try {
        const caption = Imageform.value.caption?.trim() ?? ''
        const activePost = modalStoreManagerStore.getActivePost
        if (activePost && activePost.id) {
            await postStore.updatePost(activePost.id, { content: caption, mediaUrl: previewImage.value, mediaType: previewMediaType.value, thumbnailUrl: previewMediaType.value === 'video' ? undefined : undefined, imageUrl: previewMediaType.value === 'image' ? previewImage.value : undefined })
            toast.success('Post updated successfully')
        } else {
            await postStore.createPost(caption, previewImage.value, previewMediaType.value)
            toast.success('Publicação compartilhada com sucesso')
        }

        await postStore.fetchFeed()
        currentModalStage.value = PhotoStage.PostShared
    } catch {
        currentModalStage.value = PhotoStage.PostFailed
        toast.error(postStore.error ?? 'Não foi possível compartilhar a publicação')
    } finally {
        isShareInProgress.value = false
    }
}

watch(currentModalStage, async (stage) => {
    if (stage !== PhotoStage.SharingPost) {
        return
    }

    await sharePost()

    if (currentModalStage.value === PhotoStage.PostShared) {
        setTimeout(() => {
            photoStore.$reset()
            onModalClosed()
        }, 1000)
    }
})

/**
 * If any manual adjustments triggered, then disable filter
 */
watch(currentImageAdjustments.value, () => {
    if (isFilterApplied.value) {
        isFilterApplied.value = false
    }
})

/**
 * If an active image filter triggered, then enable filter
 */
watch(activeImageFilter.value, () => {
    if (!isFilterApplied.value) {
        isFilterApplied.value = true
    }
})

// Dispara o diálogo de upload de arquivo com base no estado do componente pai
watch(() => photoStore.isFileUploadDialogOpen, (isFileUpload) => {
    if (isFileUpload)
        triggerFileUpload()
})

// Armazena a imagem de pré-visualização no store e informa o componente pai sobre o estado
watch(() => previewImage.value, (file: PhotoModalImage) => {
    photoStore.previewImage = file
    onSuccessFileUpload()
})

// Se uma publicação estiver ativa para edição, preenche o modal com os dados da publicação
watch(() => modalStoreManagerStore.getActivePost, (post: any) => {
    if (!post) return
    previewImage.value = post.mediaUrl ?? post.imageUrl ?? null
    previewMediaType.value = post.mediaType ?? (post.imageUrl ? 'image' : 'image')
    Imageform.value.caption = post.caption ?? ''
    Imageform.value.location = ''
    photoStore.previewImage = previewImage.value
    currentModalStage.value = PhotoStage.EditPostForm
})

// Monitora o tamanho da tela para evitar acessar a rota em telas grandes
watch(() => screenWidth.value, (size) => {
    const mobileScreenWidth = 550
    if(size >= mobileScreenWidth && photoStore.isToggled) {
        // limpa o estado do photoModal ao entrar em telas maiores
        photoStore.$reset()
        refreshPage()
    }
})

// Computed
const characterCount = computed(() => {
    return Imageform.value.caption ? Imageform.value.caption.length : 0
})

const isModalToggled = computed(() => {
    if (props.isToggled) return props.isToggled
    if (modalStoreManagerStore.getOpenModal === ModalName.POST) return false
    return modalStoreManagerStore.getOpenModal === ModalName.PHOTO || photoStore.isToggled
})

const largeModalHeaderName = computed(() => {
    switch (currentModalStage.value) {
        case PhotoStage.CreatePost:
            return 'Criar novo post'
        case PhotoStage.EditPostAdjustments:
        case PhotoStage.EditPostForm:
            return 'Editar'
        case PhotoStage.SharingPost:
            return 'Compartilhando'
        case PhotoStage.PostShared:
            return 'Publicação compartilhada'
        default:
            return {}
    }
})

const smallModalHeaderName = computed(() => {
    switch (currentModalStage.value) {
        case PhotoStage.CreatePost:
            return 'Novo post de foto'
        case PhotoStage.EditPostForm:
            return 'Nova publicação'
        case PhotoStage.SharingPost:
            return 'Compartilhando...'
        case PhotoStage.PostShared:
            return 'Publicação compartilhada'
        default:
            return {}
    }
})

const smallModalButtonName = computed(() => {
    return currentModalStage.value === PhotoStage.CreatePost ? 'Próximo' : currentModalStage.value != PhotoStage.PostShared ? 'Compartilhar' : 'Compartilhado'
})

const imageFilter = computed(() => {
    return activeImageFilter.value.filterClass
})

const imageBrightness = computed(() => {
    const brightness = currentImageAdjustments.value.brightness.level

    return brightness ? `brightness(${brightness}%)` : ''
})

const imageContrast = computed(() => {
    const contrast = currentImageAdjustments.value.contrast.level

    return contrast ? `contrast(${contrast}%)` : ''
})


const imageSaturation = computed(() => {
    const saturate = currentImageAdjustments.value.saturation.level

    return saturate ? `saturate(${saturate}%)` : ''
})


const filterStyle = computed(() => {
    return {
        "filter": `${imageBrightness.value} ${imageContrast.value} ${imageSaturation.value}`
    }
})

const isFiltersTabActive = computed(() => {
    return currentModalStage.value === PhotoStage.EditPostAdjustments && currentActiveFilterTab.value === PhotoTab.FiltersTab
})

const isAdjustmentsTabActive = computed(() => {
    return currentModalStage.value === PhotoStage.EditPostAdjustments && currentActiveFilterTab.value === PhotoTab.AdjustmentsTab
})

const returnButtonAction = computed(() => {
    return currentModalStage.value === PhotoStage.EditPostAdjustments ? PhotoStage.CreatePost : PhotoStage.EditPostAdjustments
})

onMounted(() => {
    previewImage.value = photoStore.previewImage ? photoStore.previewImage : null
    // acompanha a largura da tela para ajustar o comportamento em telas menores
    window.onresize = () => {
        screenWidth.value = window.innerWidth
    }
})
</script>

<style scoped>
#photo-modal {
    transition:250ms linear;
}
</style>