<template>
    <SearchWrapper 
      :title="searchTitle"
      :results="searchResults"
      :is-result-empty="isSearchResultsEmpty"
      :is-search-loading="isSearchLoading"
      @onSearchQuery="searchForUser"
      @onClearSearchQuery="clearSearchQuery"
      @onSelect="handleSearchSelect" />
</template>
 
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { SearchWrapper } from '@/components'
import { useUserStore } from '@/stores'
import type { SearchCard as SearchResult } from '@/common'

// Recent searches (localStorage)
const RECENT_SEARCH_KEY = 'visiongram.recent.searches'

const saveRecent = (username: string) => {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_SEARCH_KEY) || '[]') as string[]
    const normalized = username.trim()
    const filtered = list.filter((i) => i !== normalized)
    filtered.unshift(normalized)
    const limited = filtered.slice(0, 10)
    localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(limited))
  } catch (e) {
    // Ignora falhas ao salvar buscas recentes
  }
}

const loadRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCH_KEY) || '[]') as string[]
  } catch (e) {
    return []
  }
}

const userStore = useUserStore()
const searchForm = ref('')
const searchResults = ref<SearchResult[]>([])
const isSearchLoading = ref(false)
const suggestedUsers = ref<SearchResult[]>([])
const recentSearches = ref<string[]>([])

const searchForUser = async (payload: Event) => {
  const searchInput = payload?.target as HTMLInputElement
  searchForm.value = searchInput.value
  searchResults.value = []

  if (!searchForm.value.trim()) {
    isSearchLoading.value = false
    return
  }

  isSearchLoading.value = true

  try {
    const results = await userStore.searchUsers(searchForm.value)
    searchResults.value = results.map((user) => ({
      id: user.id,
      userName: user.userName,
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.dateJoined,
      caption: user.biography ?? '',
      bio: user.biography ?? ''
    }))
    // salva como busca recente se houver um resultado exato no topo
    if (searchResults.value.length && searchResults.value[0].userName) {
      saveRecent(searchResults.value[0].userName)
      recentSearches.value = loadRecent()
    }
  } catch {
    searchResults.value = []
  } finally {
    isSearchLoading.value = false
  }
}

const clearSearchQuery = () => {
  searchForm.value = ''
  searchResults.value = []
  // mostra sugestões quando a busca for limpa
  loadSuggestions()
}

const isSearchResultsEmpty = computed(() => searchResults.value.length === 0)
const searchTitle = computed(() => searchResults.value.length > 0 ? `Resultados de busca para "${searchForm.value}"` : 'Recentes')

const loadSuggestions = async () => {
  try {
    const users = await userStore.fetchUsers()
    suggestedUsers.value = users.slice(0, 12).map((user) => ({
      id: user.id,
      userName: user.userName,
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.dateJoined,
      caption: user.biography ?? '',
      bio: user.biography ?? ''
    }))
    // se não houver consulta ativa, mostra usuários sugeridos
    if (!searchForm.value.trim()) {
      searchResults.value = suggestedUsers.value
    }
  } catch {
    suggestedUsers.value = []
  }
}

const handleSearchSelect = (username: string) => {
  saveRecent(username)
  recentSearches.value = loadRecent()
}

onMounted(() => {
  recentSearches.value = loadRecent()
  loadSuggestions()
})
</script>