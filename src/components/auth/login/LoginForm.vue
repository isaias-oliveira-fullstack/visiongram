<template>
	<div class="flex flex-row m-auto space-x-1">
		<MobileWelcomeScreen 
			:is-mobile-login="isMobileLogin"
			@mobile-login="triggerMobileLogin"/>
		
		<WelcomeCarousel />
		
		<div 
			:class="isMobileLogin ? '' : 'hidden'"
			class="sm:flex sm:flex-col space-y-3 m-8 mb-0">
			<form 
				class="flex flex-col sm:w-80 w-screen rounded-sm border-2 border-transparent [border-image:linear-gradient(45deg,#F58529,#FEDA77,#DD2A7B,#8134AF,#515BD4)_1] p-8 md:h-fit"
				@submit.prevent>
				<!-- Ícone -->
				<div class="self-center mb-4">
				<img 
					class="w-full h-10"
					src="@/assets/images/logo-branca.png" />
				</div>

				<!-- Campo: E-mail -->
				<div class="mb-2">
					<TheInput
                        v-model="loginForm.username"
                        placeholder="Nome de usuário ou e-mail" />

                    <p
                        v-for="error of v$.username.$errors"
                        :key="error.$uid"
                        class="mt-2 text-xs text-red-600 dark:text-red-500">
                        {{ error.$message }}
                    </p>
                </div>

                <!-- Campo: Senha -->
                <div class="mb-5">
                    <TheInput
                        v-model="loginForm.password"
                        type="password"
                        placeholder="Senha" />

                    <p
                        v-for="error of v$.password.$errors"
                        :key="error.$uid"
                        class="mt-2 text-xs text-red-600 dark:text-red-500">
                        {{ error.$message }}
                    </p>
                </div>

                <!-- Botão: Entrar -->
                <TheButton
                    :size="'sm'"
                    :disabled="isLoading || v$.$invalid"
                    @click="login()">
                    <i  
                        v-if="isLoading"
                        class="fa-sharp fa-solid fa-spinner animate-spin">
                    </i>

                    <div v-else>
                        Entrar
                    </div>
                </TheButton>

                <!-- Diálogo de separação -->
    <fieldset class="border-t border-slate-300 m-4">
        <legend class="mx-auto px-4 text-gray-200 text-xs font-sans">
            OU
        </legend>
    </fieldset>

   <span
  class="flex items-center justify-center gap-2 text-sm font-semibold font-sans text-[#1877F2] cursor-not-allowed select-none"
  title="Em breve"
>
  <i class="fab fa-facebook"></i>
  Entrar com o Facebook
</span>

                <!-- Link: Redefinir senha -->
                <div class="mt-3 self-center">
                    <router-link 
                        :to="{ name: 'forgot-password' }"
                        class="text-sm font-semibold font-sans sm:hover:text-gray-400 mx-auto">
                        Esqueceu a senha?
                    </router-link>
                </div>

                <LoginFooter />
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ref,
    computed
} from 'vue'

import { useRouter } from 'vue-router'

import {
    useToast
} from 'vue-toastification'

import useVuelidate from '@vuelidate/core'

import {
    helpers,
    minLength,
    required
} from '@vuelidate/validators'

import {
    TheInput,
    TheButton,
    LoginFooter,
	MobileWelcomeScreen,
	WelcomeCarousel
} from '@/components'

import { useAuthStore } from '@/stores'
import type {
    LoginInput
} from '@/common'

// Formulário
const loginForm = ref<LoginInput>({
    username: null,
    password: null
})

// Verificadores
const isMobileLogin = ref<boolean>(false)
const isLoading = ref<boolean>(false)

// Computados
const validation = computed(() => ({
    username: {
        required: helpers.withMessage(
            'Nome de usuário é obrigatório',
            required
        )
    },
    password: {
        required: helpers.withMessage(
            'Senha é obrigatória',
            required
        ),
        minLength: helpers.withMessage(
            'Mínimo de 8 caracteres',
            minLength(8)
        )
    }
}))


const authStore = useAuthStore()

// Serviços
const toast = useToast()
const router = useRouter()
const v$ = useVuelidate(validation, loginForm)

const login = async () => {
    if (isLoading.value) {
        return
    }

    isLoading.value = true

    try {
        const valid = await v$.value.$validate()
        if (!valid) {
            return
        }

        await authStore.login({
            username: loginForm.value.username,
            password: loginForm.value.password ?? ''
        })

        toast.success('Sucesso. Redirecionando...')
        router.push({ name: 'home' })
    } catch {
        toast.error(authStore.error ?? 'Não foi possível entrar')
    } finally {
        isLoading.value = false
    }
}


// A simple and a lazy solution to display login form in mobile screens
const triggerMobileLogin = () => {
    isMobileLogin.value = !isMobileLogin.value
}

</script>