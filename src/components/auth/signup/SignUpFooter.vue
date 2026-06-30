<template>
    <!-- Prompt -->
    <p class="mt-5 font-sans text-gray-500 text-xs text-center">
        Ao se inscrever, você concorda com nossos
        <span class="text-blue-600 cursor-not-allowed">Termos</span>
        , 
        <span class="text-blue-600 cursor-not-allowed">Política de Privacidade</span>
        e
        <span class="text-blue-600 cursor-not-allowed">Política de Cookies</span>
        .
    </p>

    <!-- OR Dialog -->
    <fieldset class="border-t border-slate-300 m-4">
        <legend class="mx-auto px-4 text-gray-200 text-xs font-sans">
            OU
        </legend>
    </fieldset>

    <router-link 
        class="text-sm font-semibold font-sans sm:hover:text-gray-400 mx-auto"
        to="login">
        Entrar
    </router-link> 
</template>