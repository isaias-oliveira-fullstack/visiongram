<template>
    <span v-bind="$attrs" class="inline-flex items-center justify-center">
        <img :src="iconSrc" alt="" class="inline-block w-6 h-6" width="24" height="24" />
    </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
    icon: {
        type: String,
        required: true,
    },
    src: {
        type: String,
        default: '',
    }
})

const fileName = computed(() => `icon-${props.icon}.svg`)

const iconSrc = computed(() => {
    if (props.src) {
        return props.src
    }

    try {
        return new URL(`../../../assets/icons/${fileName.value}`, import.meta.url).href
    } catch {
        return ''
    }
})
</script>