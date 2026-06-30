<template>
    <div class="mt-3 py-3 text-center">
        <span class="font-sans text-sm">
            Não tem uma conta?
        </span>
        <router-link
            to="signup"
            class="font-sans font-semibold text-sm text-sky-500">
            Cadastre-se
        </router-link>
    </div>

    <div class="mt-3 text-center space-y-3 hidden sm:block">
        <span class="font-sans text-sm">
            Obtenha o aplicativo.
        </span>
        <div class="mt-2 flex flex-row space-x-4 self-center">
            <img 
                class="w-30 cursor-not-allowed"
                src="@/assets/images/apple-store.png" />
            <img 
                class="w-30 cursor-not-allowed"
                src="@/assets/images/google-store.png" />
        </div>
    </div>
</template>