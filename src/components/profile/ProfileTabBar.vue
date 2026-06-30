<template>
  <div class="border-t border-[#262626]">
    <ul class="flex flex-wrap items-center justify-between gap-2 px-2 pt-1 sm:px-6 md:justify-center md:gap-8">
      <li
        v-for="(tab, index) in tabElements"
        :key="index"
        class="cursor-pointer"
        :class="{ 'md:hidden block': tab.name === ProfileTab.Peeds }"
        @click="emitTabSwitch(tab.name as NavBarTabs)"
      >
        <div :class="getTabClass(tab.name)" class="flex items-center gap-2 px-2 py-3">
          <SVGLoader :icon="tab.iconLarge" class="hidden md:block" />
          <SVGLoader :icon="tab.iconSmall" class="block md:hidden" />
          <span class="hidden text-[12px] font-semibold uppercase tracking-[0.2em] md:block">{{ tab.label }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type {
    PropType
} from 'vue'

import {
    SVGLoader
} from '@/components'

import {
    type NavBarTabs,
    type ProfileTabElement,
    ProfileTab,
} from '@/common'

const prop = defineProps({
    currentTab: {
        type: String as PropType<NavBarTabs>,
        required: true
    }
})
const emit = defineEmits(['switchTab'])


const tabElements: ProfileTabElement[] = [{
        name: ProfileTab.Posts,
        label: 'PUBLICAÇÕES',
        iconLarge: 'profile-posts-large',
        iconSmall: 'profile-posts-small',
        action: () => emitTabSwitch(ProfileTab.Posts)
    },
    {
        name: ProfileTab.Peeds,
        label: 'REELS',
        iconLarge: 'profile-peed-large',
        iconSmall: 'profile-peed-small',
        action: () => emitTabSwitch(ProfileTab.Peeds)
    },
    {
        name: ProfileTab.Saved,
        label: 'SALVOS',
        iconLarge: 'profile-saved-large',
        iconSmall: 'profile-saved-small',
        action: () => emitTabSwitch(ProfileTab.Saved)
    },
    {
        name: ProfileTab.Tagged,
        label: 'MARCADOS',
        iconLarge: 'profile-tagged-large',
        iconSmall: 'profile-tagged-small',
        action: () => emitTabSwitch(ProfileTab.Tagged)
    },
]

const emitTabSwitch = (currentTab: NavBarTabs) => {
    emit('switchTab', currentTab)
}

/**
 * Retorna a classe da aba com base na aba ativa
 * @param tabName O nome da aba atual
 */
const getTabClass = (tabName: string) => {
    return {
        'flex items-center space-x-2 inline-block py-4 p-1 border-t-2 border-gray-300 sm:hover:border-gray-300': true,
        'border-transparent text-gray-200': prop.currentTab !== tabName && tabName !==
            ProfileTab.Saved && tabName !== ProfileTab.Tagged,
        'border-transparent text-gray-300': prop.currentTab !== tabName && (tabName ===
            ProfileTab.Saved || tabName === ProfileTab.Tagged),
        'text-white': prop.currentTab === tabName,
        'sm:hover:text-gray-300': prop.currentTab !== tabName && (tabName === ProfileTab.Saved ||
            tabName === ProfileTab.Tagged),
    }
}
</script>