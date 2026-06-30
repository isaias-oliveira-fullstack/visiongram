<template>
  <div class="mx-auto h-screen w-full max-w-[975px] px-3 py-3 sm:px-4 sm:py-6">
    <div class="flex h-full flex-col overflow-hidden rounded-[16px] border border-[#262626] bg-[#121212]">
      <SearchTitle />

      <SearchBar
        :is-loading="isSearchLoading"
        @onSearchQuery="$emit('onSearchQuery', $event)"
        @on-clear-search-query="$emit('onClearSearchQuery')"
      />

      <SearchFeed
        :search-title="title"
        :is-empty="isResultEmpty"
        :is-loading="isSearchLoading"
        :results="results"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
    PropType
} from 'vue'

import {
    SearchBar,
    SearchFeed,
    SearchTitle
} from '@/components'

import type {
    SearchCard as SearchResult
} from '@/common'

defineProps({
    title: {
        type: String,
        required: true
    },
    results: {
        type: Array as PropType <SearchResult[]> ,
        required: true
    },
    isResultEmpty: {
        type: Boolean,
        required: true
    },
    isSearchLoading: {
        type: Boolean,
        required: true
    }
})

defineEmits([
    'onSearchQuery',
    'onClearSearchQuery',
    'onSelect'
])
</script>