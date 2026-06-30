<template>
  <div class="flex flex-col max-w-sm w-full rounded-sm border-2 border-transparent [border-image:linear-gradient(45deg,#F58529,#FEDA77,#DD2A7B,#8134AF,#515BD4)_1] m-auto">
    <form class="flex flex-col p-12 space-y-4" @submit.prevent="handleSubmit">
      <div class="self-center">
        <img src="@/assets/images/icon-1.png" />
      </div>

      <div class="font-sans text-md font-semibold text-gray-200 self-center">
        Redefinir senha
      </div>

      <div class="font-sans text-sm font-light text-gray-200">
        Defina uma nova senha para sua conta. O token de redefinição deve estar presente na URL.
      </div>

      <div>
        <TheInput
          v-model="resetForm.password"
          type="password"
          placeholder="Nova senha"
          :class="{ 'border-red-400': v$.password.$dirty && v$.password.$invalid }"
          @blur="v$.password.$touch" />

        <p v-for="error of v$.password.$errors" :key="error.$uid" class="mt-2 text-xs text-red-600 dark:text-red-500">
          {{ error.$message }}
        </p>
      </div>

      <div>
        <TheInput
          v-model="resetForm.confirmPassword"
          type="password"
          placeholder="Confirmar nova senha"
          :class="{ 'border-red-400': v$.confirmPassword.$dirty && v$.confirmPassword.$invalid }"
          @blur="v$.confirmPassword.$touch" />

        <p v-for="error of v$.confirmPassword.$errors" :key="error.$uid" class="mt-2 text-xs text-red-600 dark:text-red-500">
          {{ error.$message }}
        </p>
      </div>

      <TheButton size="sm" :disabled="isLoading || v$.$invalid || !token" type="submit">
        <i v-if="isLoading" class="fa-sharp fa-solid fa-spinner animate-spin"></i>
        <div v-else>Redefinir senha</div>
      </TheButton>

      <div v-if="!token" class="text-red-600 text-sm text-center">
        Token de redefinição ausente. Volte para a página de recuperação de senha.
      </div>

        <!-- OR Dialog -->
    <fieldset class="border-t border-slate-300 m-4">
        <legend class="mx-auto px-4 text-gray-200 text-xs font-sans">
            OU
        </legend>
    </fieldset>

      <router-link class="text-sm font-semibold font-sans sm:hover:text-gray-400 mx-auto" :to="{ name: 'forgot-password' }">
        Solicitar outro link
      </router-link>
    </form>

    <div class="pt-2 pb-2 w-full text-center self-center border">
      <router-link class="text-sm font-semibold font-sans sm:hover:text-gray-400" :to="{ name: 'login' }">
        Entrar
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useVuelidate from '@vuelidate/core'
import { helpers, minLength, required, sameAs } from '@vuelidate/validators'
import { useToast } from 'vue-toastification'
import TheInput from '../../core/basics/TheInput.vue'
import TheButton from '../../core/basics/TheButton.vue'
import { authService } from '@/services/auth.service'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const resetForm = ref({
  password: null as string | null,
  confirmPassword: null as string | null
})

const validation = computed(() => ({
  password: {
    required: helpers.withMessage('Senha é obrigatória', required),
    minLength: helpers.withMessage('Mínimo de 8 caracteres', minLength(8))
  },
  confirmPassword: {
    required: helpers.withMessage('Confirmação é obrigatória', required),
    sameAsPassword: helpers.withMessage('As senhas devem ser iguais', sameAs(() => resetForm.value.password))
  }
}))

const v$ = useVuelidate(validation, resetForm)
const isLoading = ref(false)
const token = ref<string | null>(null)

token.value = route.query.token ? String(route.query.token) : null

const handleSubmit = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const valid = await v$.value.$validate()
    if (!valid) return
    if (!token.value) {
      toast.error('Token de redefinição não encontrado na URL.')
      return
    }

    await authService.resetPassword(token.value, resetForm.value.password ?? '')
    toast.success('Senha redefinida com sucesso. Faça login novamente.')
    router.push({ name: 'login' })
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? error?.message ?? 'Não foi possível redefinir a senha.')
  } finally {
    isLoading.value = false
  }
}
</script>
