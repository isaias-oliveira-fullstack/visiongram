<template>
	<form 
		class="flex flex-col sm:w-80 w-full rounded-sm border-2 border-transparent [border-image:linear-gradient(45deg,#F58529,#FEDA77,#DD2A7B,#8134AF,#515BD4)_1] p-8 m-auto"
		@submit.prevent>

        <SignUpHeader />
		<!-- Input: Email -->
		<div class="mb-2">
			<TheInput
				v-model="signupForm.email"
				type="email" 
				placeholder="E-mail" 
				:class="{
					'border-red-400': v$.email.$dirty && v$.email.$invalid 
                }"
				@blur="v$.email.$touch" />

			<p
				v-for="error of v$.email.$errors"
				:key="error.$uid"
				class="mt-2 text-xs text-red-600 dark:text-red-500">
				{{ error.$message }}
			</p>
		</div>

		<!-- Input:First Name -->
		<div class="mb-2">
			<TheInput
				v-model="signupForm.firstName" 
				placeholder="Nome" 
				:class="{
					'border-red-400': v$.firstName.$dirty && v$.firstName.$invalid 
                }"
				@blur="v$.firstName.$touch" />

			<p
				v-for="error of v$.firstName.$errors"
				:key="error.$uid"
				class="mt-2 text-xs text-red-600 dark:text-red-500">
				{{ error.$message }}
			</p>
		</div>

		<!-- Input:Last Name -->
		<div class="mb-2">
			<TheInput
				v-model="signupForm.lastName" 
				placeholder="Sobrenome" 
				:class="{
					'border-red-400': v$.lastName.$dirty && v$.lastName.$invalid 
				}"
				@blur="v$.lastName.$touch" />

			<p
				v-for="error of v$.lastName.$errors"
				:key="error.$uid"
				class="mt-2 text-xs text-red-600 dark:text-red-500">
				{{ error.$message }}
			</p>
		</div>

		<!-- Input: Username -->
		<div class="mb-2">
			<TheInput
				v-model="signupForm.username" 
				placeholder="Nome de usuário" 
				:class="{
					'border-red-400': v$.username.$dirty &&
						v$.username.$invalid 
                }"
				@blur="v$.username.$touch" />

			<p
				v-for="error of v$.username.$errors"
				:key="error.$uid"
				class="mt-2 text-xs text-red-600 dark:text-red-500">
				{{ error.$message }}
			</p>
		</div>


		<!-- Input: Password -->
		<div class="mb-5">
			<TheInput
				v-model="signupForm.password"
				type="password" 
				placeholder="Senha"
				:class="{
					'border-red-400': v$.password.$dirty &&
						v$.password.$invalid 
                }"
				@blur="v$.password.$touch" />
    
			<p
				v-for="error of v$.password.$errors"
				:key="error.$uid"
				class="mt-2 text-xs text-red-600 dark:text-red-500">
				{{ error.$message }}
			</p>
		</div>

		<!-- Button: Sign Up -->
		<TheButton
			:size="'sm'"
			:disabled="isLoading || v$.$invalid"
			@click="signup()">
			<i  
				v-if="isLoading"
				class="fa-sharp fa-solid fa-spinner animate-spin">
			</i>

			<div v-else>
				Cadastrar
			</div>
		</TheButton>

		<SignUpFooter />
	</form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import useVuelidate from '@vuelidate/core'
import { email, helpers, minLength, required } from '@vuelidate/validators'
import { useToast } from 'vue-toastification'
import TheInput from '../../core/basics/TheInput.vue'
import TheButton from '../../core/basics/TheButton.vue'
import SignUpFooter from './SignUpFooter.vue'
import SignUpHeader from './SignUpHeader.vue'
import { useAuthStore } from '@/stores'
import type { RegisterInput } from '@/common'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const signupForm = ref<RegisterInput>({
  email: null,
  firstName: null,
  lastName: null,
  username: null,
  password: null,
  avatar: null,
  bio: null
})

const isLoading = ref<boolean>(false)

const validation = computed(() => ({
  email: {
    required: helpers.withMessage('E-mail é obrigatório', required),
    email: helpers.withMessage('E-mail válido é obrigatório', email)
  },
  firstName: {
    required: helpers.withMessage('Por favor, insira seu nome', required)
  },
  lastName: {
    required: helpers.withMessage('Por favor, insira seu sobrenome', required)
  },
  username: {
    required: helpers.withMessage('Nome de usuário é obrigatório', required)
  },
  password: {
    required: helpers.withMessage('Senha é obrigatória', required),
    minLength: helpers.withMessage('Mínimo de 8 caracteres', minLength(8))
  }
}))

const v$ = useVuelidate(validation, signupForm)

const signup = async () => {
  if (isLoading.value) {
    return
  }

  isLoading.value = true

  try {
    const valid = await v$.value.$validate()
    if (!valid) {
      return
    }

    await authStore.register(signupForm.value)

    toast.success('Sucesso. Redirecionando...')
    router.push({ name: 'home' })
  } catch {
    toast.error(authStore.error ?? 'Não foi possível cadastrar')
  } finally {
    isLoading.value = false
  }
}
</script>