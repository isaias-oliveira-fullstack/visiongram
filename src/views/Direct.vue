<template>
    <div class="flex md:flex-row flex-col h-screen">
        <!-- Navegação e visão geral das mensagens -->
        <InboxPanel 
            :active-conversation="activeConversation"
            :conversations="conversations"
            :current-user="currentUser"
            @on-select-conversation="selectConversation" />

        <!-- Entrada de chat e diálogos -->
        <ActiveChat 
            v-if="activeConversation"
            v-model="chatMessageInput"
            :active-conversation="activeConversation"
            :current-user="currentUser"
            :is-chat-loading="isChatLoading"
            :is-chat-empty="true"
            @on-chat-back="leaveChat"
            @on-file-upload="triggerFileUpload"
            @on-send-message="sendMessage"
            @on-like-icon="onUnsupportedFeatureClick" />
            
        <!-- Introdução do chat -->
        <ChatIntroMessage 
            v-else
            @on-send-message-modal="onUnsupportedFeatureClick" />
    </div>
    
    <!-- Envio de arquivo -->
    <input
        ref="fileUpload"
        accept="image/*"
        type="file"
        hidden
        @change="onFileUpload" /> 
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { ChatIntroMessage, ActiveChat, InboxPanel } from '@/components'
import { useAuthStore } from '@/stores'
import type { ChatDialog, HTMLInputElementRef, PhotoModalImage, Conversation, User } from '@/common'
import { getCurrentTimestamp } from '@/common/helpers'

const authStore = useAuthStore()
const toast = useToast()
const fileUpload = ref<HTMLInputElementRef | null>(null)
const attachmentImage = ref<PhotoModalImage>(null)
const chatMessageInput = ref<string | undefined>(undefined)
const isFileUploaded = ref<boolean>(false)
const isFileValid = ref<boolean>(false)
const isChatLoading = ref<boolean>(false)
const activeConversation = ref<Conversation | undefined>(undefined)

const currentUser = computed<User>(() => authStore.user ?? {
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

const route = useRoute()

const DIRECT_STORAGE_KEY = 'direct.conversations'

const loadSavedConversations = (): Conversation[] => {
  try {
    const raw = localStorage.getItem(DIRECT_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Conversation[]) : []
  } catch {
    return []
  }
}

const saveConversations = (conversationsToSave: Conversation[]) => {
  try {
    localStorage.setItem(DIRECT_STORAGE_KEY, JSON.stringify(conversationsToSave))
  } catch {
    // ignora erros de armazenamento local
  }
}

const conversations = ref<Conversation[]>(loadSavedConversations())
const chatMessage = ref<ChatDialog>({})

const sendMessage = (text: string) => {
  const value = text?.trim() ?? ''

  if (!value) {
    return
  }

  chatMessage.value = {
    text: value,
    timestamp: getCurrentTimestamp(),
    isSentByViewer: true
  }

  chatMessageInput.value = ''
}

const triggerFileUpload = () => {
  fileUpload.value?.click()
}

const onFileUpload = async (event: Event) => {
  const targetEvent = event.target as HTMLInputElement
  const file = targetEvent?.files?.item(0)

  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = (loadEvent) => {
    attachmentImage.value = loadEvent.target?.result as string
    isFileValid.value = true
    isFileUploaded.value = true

    chatMessage.value = {
      img: attachmentImage.value as string,
      timestamp: getCurrentTimestamp(),
      isSentByViewer: true
    }
  }
}

const buildConversation = (userId: string, userName: string): Conversation => {
  return {
    uuid: userId,
    user: {
      id: userId,
      firstName: userName,
      lastName: '',
      userName,
      gender: 'Other',
      profilePictureUrl: '',
      followerCount: 0,
      followingCount: 0,
      dateJoined: '',
      mediaItems: [],
      biography: ''
    },
    lastMessage: '',
    timeSinceLastMessage: new Date().toISOString(),
    dialogs: [],
    isActive: true
  }
}

const loadConversationFromQuery = () => {
  const userId = route.query.userId as string | undefined
  const username = route.query.username as string | undefined

  if (!userId || !username) {
    return
  }

  const existing = conversations.value.find((convo) => convo.uuid === userId)

  if (existing) {
    activeConversation.value = existing
    return
  }

  const newConversation = buildConversation(userId, username)
  conversations.value = [newConversation, ...conversations.value]
  activeConversation.value = newConversation
  saveConversations(conversations.value)
}

const selectConversation = (convo: Conversation) => {
  activeConversation.value = convo
}

const leaveChat = () => {
  activeConversation.value = undefined
}

const onUnsupportedFeatureClick = () => {
  toast.info('Este recurso ainda não é suportado.')
}

const scrollToTheLatestMessage = () => {
  const target = document.querySelector('#last-element')
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

watch(chatMessage, () => {
  if (chatMessage.value.text || chatMessage.value.img) {
    if (activeConversation.value) {
      activeConversation.value.dialogs = [
        ...(activeConversation.value.dialogs ?? []),
        chatMessage.value
      ]
      const storedIndex = conversations.value.findIndex(
        (convo) => convo.uuid === activeConversation.value?.uuid
      )
      if (storedIndex >= 0) {
        conversations.value.splice(storedIndex, 1, activeConversation.value)
      }
    }
    chatMessage.value = {}
    scrollToTheLatestMessage()
  }
})

watch(
  conversations,
  (value) => {
    saveConversations(value)
  },
  { deep: true }
)

onMounted(() => {
  loadConversationFromQuery()
  // Se não houver conversa na rota, restaura a mais recente salva
  if (!activeConversation.value && conversations.value.length > 0) {
    activeConversation.value = conversations.value[0]
  }
})

watch(
  () => route.query,
  () => {
    loadConversationFromQuery()
  },
  { deep: true }
)

watch(activeConversation, () => {
  isChatLoading.value = !!activeConversation.value
  setTimeout(() => {
    isChatLoading.value = false
    scrollToTheLatestMessage()
  }, 500)
})
</script>