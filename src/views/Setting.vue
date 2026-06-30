<template>
  <div :class="isToggledClass" class="mx-auto min-h-screen w-full max-w-243.75 px-3 py-3 sm:px-4 sm:py-6">
    <div class="flex min-h-180 overflow-hidden rounded-2xl border border-[#262626] bg-[#121212]">
      <SettingNavigator
        :active-setting-tab="activeSettingTab"
        :is-mobile-screen="isMobileScreen"
        @edit-profile="activeSettingTab = 'edit-profile'"
      />

      <SettingForm
        :user="user"
        :is-mobile-screen="isMobileScreen"
        :active-setting-tab="activeSettingTab"
        @gender-modal="toggleGenderModal"
      />
    </div>
  </div>
    <GenderModal 
        :title="genderModal.title"
        :is-toggled="genderModal.isToggled" 
        :items="genderModal.items"
        :modal-type="ModalName.GENDER" 
        :modal-size="ModalSize.Medium"
        @on-modal-closed="toggleGenderModal" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { SmallModal as GenderModal, SettingNavigator, SettingForm } from '@/components'
import { ScreenBreakpoint, ModalSize, ModalName, type User } from '@/common'
import { useModalManagerStore, useAuthStore } from '@/stores'

const authStore = useAuthStore()
const router = useRouter()
const user = computed<User>(() => authStore.user ?? {
  id: '',
  firstName: '',
  lastName: '',
  userName: '',
  gender: 'Other',
  profilePictureUrl: '',
  followerCount: 0,
  followingCount: 0,
  dateJoined: '',
  mediaItems: [],
  biography: ''
})

const genderModal = ref({
  name: '',
  title: 'Gender',
  items: [
    { name: 'male' },
    { name: 'female' },
    { name: 'other' }
  ],
  selectedGender: 'Female',
  isToggled: false
})

const activeSettingTab = ref<null| string>(null)
const screenWidth = ref<number>(window.innerWidth) // Largura atual da janela
const modalStoreManager = useModalManagerStore()

const toggleGenderModal = () => {
    genderModal.value.isToggled = !genderModal.value.isToggled
    modalStoreManager.toggleModal(ModalName.GENDER)
}

const isMobileScreen = computed(() => {
    return screenWidth.value <= ScreenBreakpoint.Medium
})

const isToggledClass = computed(() => {
    return genderModal.value.isToggled ? "lights-off" : ""
})

onMounted(() => {
    screenWidth.value = window.innerWidth 
})
</script>