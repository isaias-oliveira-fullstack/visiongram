<template>
    <div 
        v-show="!isMobileLogin"
        class="block sm:hidden">
        <!-- Icon -->
        <img 
            class="mx-auto"
            src="@/assets/images/mobile-small-icon.png" />
        <div class="flex flex-col">
            <div class="p-5 font-sans text-center text-2xl sm:w-72 w-11/12"> 
                Cadastre-se para ver 
                <span class="text-rose-500">
                    fotos
                </span>
                e
                <span class="text-rose-600">
                    vídeos
                </span>
                dos seus amigos.
            </div>
            <div class="text-center">
                <span
                    class="font-sans font-semibold text-sm text-sky-500 cursor-pointer"
                    @click="$emit('mobileLogin')">
                    Entrar
                </span>
                ou
                <router-link
                    to="signup"
                    class="font-sans font-semibold text-sm text-sky-500">
                    Cadastre-se
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    isMobileLogin: Boolean
})

defineEmits([
    'mobileLogin'
])
</script>