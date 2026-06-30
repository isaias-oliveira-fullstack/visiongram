<template>
  <div v-show="activeSettingTab === 'edit-profile' || !isMobileScreen" class="flex flex-1 flex-col gap-5 bg-[#121212] p-5 sm:p-8">
    <div class="text-[24px] font-light text-white">Editar perfil</div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-900 text-red-100 p-3 rounded">
            {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="bg-green-900 text-green-100 p-3 rounded">
            {{ successMessage }}
        </div>

        <form class="mx-auto flex w-full max-w-155 flex-col gap-4 rounded-2xl border border-[#262626] bg-[#000000]/30 p-4 sm:p-6" @submit.prevent="submitForm">
            <div class="flex items-center gap-4">
                <ProfileAvatar :src="formData.profilePicture || user.profilePictureUrl" :size="40" />
                <div class="flex flex-col">
                    <div class="text-[14px] font-semibold text-white">{{ user.userName }}</div>
                    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handlePhotoChange" />
                    <button type="button" class="text-[14px] font-semibold text-[#0095f6] transition hover:text-white" @click="fileInput?.click()">Alterar foto de perfil</button>
                </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="mb-2 block text-[14px] font-semibold text-white">Nome</label>
                    <input v-model="formData.firstName" type="text" placeholder="Nome" class="block w-full rounded-xl border border-[#262626] bg-[#121212] px-3 py-2.5 text-[14px] text-white placeholder:text-[#737373]" />
                </div>
                <div>
                    <label class="mb-2 block text-[14px] font-semibold text-white">Sobrenome</label>
                    <input v-model="formData.lastName" type="text" placeholder="Sobrenome" class="block w-full rounded-xl border border-[#262626] bg-[#121212] px-3 py-2.5 text-[14px] text-white placeholder:text-[#737373]" />
                </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="mb-2 block text-[14px] font-semibold text-white">E-mail</label>
                    <input v-model="formData.email" type="email" placeholder="E-mail" class="block w-full rounded-xl border border-[#262626] bg-[#121212] px-3 py-2.5 text-[14px] text-white placeholder:text-[#737373]" />
                </div>
                <div>
                    <label class="mb-2 block text-[14px] font-semibold text-white">Nome de usuário</label>
                    <input v-model="formData.username" type="text" placeholder="Nome de usuário" class="block w-full rounded-xl border border-[#262626] bg-[#121212] px-3 py-2.5 text-[14px] text-white placeholder:text-[#737373]" />
                </div>
            </div>

            <div>
                <label class="mb-2 block text-[14px] font-semibold text-white">Biografia</label>
                <textarea v-model="formData.bio" rows="3" placeholder="Fale um pouco sobre você" class="w-full rounded-xl border border-[#262626] bg-[#121212] px-3 py-2.5 text-[14px] text-white placeholder:text-[#737373]"></textarea>
            </div>

            <div class="grid gap-4 md:grid-cols-[1fr_220px] md:items-center">
                <label class="text-[14px] font-semibold text-white">Gênero</label>
                <select v-model="selectedGender" class="w-full rounded-xl border border-[#262626] bg-[#121212] px-3 py-2.5 text-[14px] text-white">
                    <option value="Female">Feminino</option>
                    <option value="Male">Masculino</option>
                    <option value="Other">Outro</option>
                </select>
            </div>

            <div class="rounded-2xl border border-[#262626] bg-[#000000]/30 p-4">
                <div class="mb-3 text-[14px] font-semibold text-white">Alterar senha</div>
                <div class="grid gap-3">
                    <input v-model="formData.currentPassword" type="password" placeholder="Senha atual" class="block w-full rounded-xl border border-[#262626] bg-[#121212] px-3 py-2.5 text-[14px] text-white placeholder:text-[#737373]" />
                    <input v-model="formData.newPassword" type="password" placeholder="Nova senha" class="block w-full rounded-xl border border-[#262626] bg-[#121212] px-3 py-2.5 text-[14px] text-white placeholder:text-[#737373]" />
                    <input v-model="formData.confirmNewPassword" type="password" placeholder="Confirmar nova senha" class="block w-full rounded-xl border border-[#262626] bg-[#121212] px-3 py-2.5 text-[14px] text-white placeholder:text-[#737373]" />
                </div>
            </div>

            <TheButton :size="'sm'" type="submit" :disabled="isLoading">
                <span class="sm:text-md sm:font-semibold">{{ isLoading ? 'Salvando...' : 'Salvar alterações' }}</span>
            </TheButton>
        </form>

        <div class="mx-auto mt-4 w-full max-w-155 rounded-2xl border border-red-600/20 bg-red-950/40 p-5 space-y-4">
            <div class="text-lg font-semibold text-red-200">Excluir conta</div>
            <p class="text-sm text-gray-300">
                Esta ação é permanente e removerá seu perfil, publicações, comentários, curtidas, publicações salvas, seguidores e relações de seguindo, além de notificações.
            </p>
            <TheButton
                :size="'sm'"
                type="button"
                class="bg-red-700 hover:bg-red-600 border border-red-600"
                :disabled="deleteInProgress"
                @click="openDeleteAccountModal">
                <span class="sm:text-md sm:font-semibold">
                    Excluir minha conta
                </span>
            </TheButton>
        </div>

        <Transition name="modal-fade">
            <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                <div class="w-full max-w-lg rounded-3xl border border-gray-700 bg-slate-1100 text-white shadow-2xl overflow-hidden">
                    <div class="flex items-center justify-between px-6 py-5 border-b border-gray-700">
                        <div class="text-xl font-semibold">Excluir conta?</div>
                        <button class="text-gray-400 hover:text-white" :disabled="deleteInProgress" @click="closeDeleteAccountModal">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <div class="space-y-4 px-6 py-5">
                        <p class="text-sm text-gray-300 leading-7">
                            Esta ação é permanente e não poderá ser desfeita.
                        </p>
                        <div class="space-y-2 text-sm text-gray-300">
                            <p>Todos os seus dados serão removidos, incluindo:</p>
                            <ul class="list-disc list-inside space-y-1">
                                <li>Perfil</li>
                                <li>Publicações</li>
                                <li>Comentários</li>
                                <li>Curtidas</li>
                                <li>Postagens salvas</li>
                                <li>Seguidores e seguindo</li>
                                <li>Mensagens (caso existam)</li>
                            </ul>
                        </div>
                        <p class="text-sm text-gray-300 font-semibold">Tem certeza de que deseja excluir sua conta?</p>
                        <div v-if="deleteErrorMessage" class="rounded-lg bg-red-900 px-4 py-3 text-sm text-red-100">
                            {{ deleteErrorMessage }}
                        </div>
                        <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <TheButton
                                :size="'sm'"
                                type="button"
                                class="bg-gray-700 text-white hover:bg-gray-600"
                                :disabled="deleteInProgress"
                                @click="closeDeleteAccountModal">
                                Cancelar
                            </TheButton>
                            <TheButton
                                :size="'sm'"
                                type="button"
                                class="bg-red-700 text-white hover:bg-red-600"
                                :disabled="deleteInProgress"
                                @click="confirmDeleteAccount">
                                {{ deleteInProgress ? 'Excluindo...' : 'Excluir minha conta' }}
                            </TheButton>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { PropType } from 'vue'
import TheButton from '../core/basics/TheButton.vue'
import TheInput from '../core/basics/TheInput.vue'
import ProfileAvatar from '../core/basics/ProfileAvatar.vue'
import type { User } from '@/common'
import { normalizeGenderValue } from '@/common/helpers'
import { authService } from '@/services/auth.service'
import { useAuthStore, usePostStore } from '@/stores'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const props = defineProps({
    user: {
        type: Object as PropType<User>,
        required: true
    },
    isMobileScreen: {
        type: Boolean,
        required: true
    },
    activeSettingTab: {
        type: String as () => string | null
    }
})

defineEmits(['gender-modal'])

const authStore = useAuthStore()
const postStore = usePostStore()
const router = useRouter()
const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showDeleteModal = ref(false)
const deleteInProgress = ref(false)
const deleteErrorMessage = ref('')

const getStoredGenderPreference = () => {
    if (typeof window === 'undefined') return ''
    return normalizeGenderValue(window.localStorage.getItem('settings.preferredGender'))
}

const persistGenderPreference = (value?: string | null) => {
    const normalized = normalizeGenderValue(value)
    selectedGender.value = normalized
    formData.gender = normalized

    if (typeof window !== 'undefined') {
        window.localStorage.setItem('settings.preferredGender', normalized)
    }
}

const selectedGender = ref(getStoredGenderPreference() || normalizeGenderValue(props.user.gender))

const formData = reactive({
    firstName: props.user.firstName || '',
    lastName: props.user.lastName || '',
    email: props.user.email || '',
    username: props.user.userName || '',
    bio: props.user.biography || '',
    gender: selectedGender.value,
    profilePicture: props.user.profilePictureUrl || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
})

watch(
  () => props.user,
  (user) => {
    formData.firstName = user.firstName || ''
    formData.lastName = user.lastName || ''
    formData.email = user.email || ''
    formData.username = user.userName || ''
    formData.bio = user.biography || ''

    const nextGender = normalizeGenderValue(user.gender)
    const storedGender = getStoredGenderPreference()
    const preferredGender = storedGender !== 'Other'
      ? storedGender
      : nextGender !== 'Other'
        ? nextGender
        : selectedGender.value

    persistGenderPreference(preferredGender)
    formData.profilePicture = user.profilePictureUrl || ''
  },
  { immediate: true, deep: true }
)

watch(selectedGender, (value) => {
  persistGenderPreference(value)
}, { immediate: true })

const handlePhotoChange = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    // Converte para base64 para demo (em produção, fazer upload para um serviço de armazenamento)
    const reader = new FileReader()
    reader.onload = (e) => {
        formData.profilePicture = e.target?.result as string
    }
    reader.readAsDataURL(file)
}

const submitForm = async () => {
    if (!props.user.id) {
        errorMessage.value = 'ID do usuário não encontrado'
        return
    }

    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const normalizedGender = normalizeGenderValue(selectedGender.value)

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            name: `${formData.firstName ?? ''} ${formData.lastName ?? ''}`.trim(),
            username: formData.username,
            email: formData.email,
            bio: formData.bio,
            gender: normalizedGender,
            avatar: formData.profilePicture
        }
        // payload de saída preparado

        const response = await authService.updateProfile(props.user.id, payload)

        // Atualiza o store de autenticação com os dados do usuário
        if (response.data && authStore.token) {
            const responseUser = response.data as User
            authStore.setAuth({ ...responseUser, gender: normalizedGender }, authStore.token)
        }

        persistGenderPreference(normalizedGender)

        // Se o usuário solicitou alteração de senha, valida e chama a API
        if (formData.newPassword) {
            if (formData.newPassword !== formData.confirmNewPassword) {
                throw new Error('A nova senha e a confirmação não coincidem')
            }
            await authService.changePassword(props.user.id, formData.currentPassword, formData.newPassword)
        }

        successMessage.value = 'Perfil atualizado com sucesso!'
        toast.success('Perfil atualizado com sucesso!')
    } catch (error: any) {
        const message = error?.response?.data?.message || error.message || 'Não foi possível atualizar o perfil'
        errorMessage.value = message
        toast.error(message)
    } finally {
        isLoading.value = false
    }
}

const openDeleteAccountModal = () => {
    deleteErrorMessage.value = ''
    showDeleteModal.value = true
}

const closeDeleteAccountModal = () => {
    if (deleteInProgress.value) return
    deleteErrorMessage.value = ''
    showDeleteModal.value = false
}

const clearAppStateAfterDelete = async () => {
    authStore.clearAuth()
    postStore.$reset()
    sessionStorage.clear()

    if (window.caches) {
        const cacheNames = await window.caches.keys()
        await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)))
    }
}

const confirmDeleteAccount = async () => {
    deleteInProgress.value = true
    deleteErrorMessage.value = ''

    try {
        await authService.deleteAccount()
        await clearAppStateAfterDelete()
        showDeleteModal.value = false
        toast.success('Sua conta foi excluída com sucesso.')
        router.push('/accounts/login')
    } catch (error: any) {
        const message = error?.response?.data?.message || error.message || 'Falha ao excluir a conta'
        deleteErrorMessage.value = message
        toast.error(message)
    } finally {
        deleteInProgress.value = false
    }
}
</script>

<style scoped>
.setting-bio-textarea {
    background: transparent;
    border: 1px solid;
    border-radius: 3px;
    box-sizing: border-box;
    flex: 0 1 355px;
    font-size: 16px;
    height: 60px;
    padding: 6px 10px;
    resize: vertical;
}
</style>