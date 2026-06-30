<template>
  <div class="flex flex-col max-w-sm w-full rounded-sm border-2 border-transparent [border-image:linear-gradient(45deg,#F58529,#FEDA77,#DD2A7B,#8134AF,#515BD4)_1] m-auto">
    <form
      class="flex flex-col p-12 space-y-4"
      @submit.prevent="sendResetLink">
      <div class="self-center">
        <img src="@/assets/images/icon-1.png" />
      </div>

      <div class="font-sans text-md font-semibold text-gray-200 self-center">
        Problemas para fazer login?
      </div>

      <div class="font-sans text-sm font-light text-gray-200">
        Digite seu e-mail ou nome de usuário e enviaremos um link para recuperar sua conta.
      </div>

      <div>
        <TheInput
          v-model="forgotForm.username"
          placeholder="Nome de usuário ou e-mail"
          :class="{ 'border-red-400': v$.username.$dirty && v$.username.$invalid }"
          @blur="v$.username.$touch" />

        <p
          v-for="error of v$.username.$errors"
          :key="error.$uid"
          class="mt-2 text-xs text-red-600 dark:text-red-500">
          {{ error.$message }}
        </p>
      </div>

      <TheButton
        size="sm"
        :disabled="isLoading || v$.$invalid"
        type="submit">
        <i v-if="isLoading" class="fa-sharp fa-solid fa-spinner animate-spin"></i>
        <div v-else>Enviar link de acesso</div>
      </TheButton>

        <!-- OR Dialog -->
    <fieldset class="border-t border-slate-300 m-4">
        <legend class="mx-auto px-4 text-gray-200 text-xs font-sans">
            OU
        </legend>
    </fieldset>

      <router-link class="text-sm font-semibold font-sans sm:hover:text-gray-400 mx-auto" to="signup">
        Criar nova conta
      </router-link>

    <div class="pt-2 w-full text-center self-center">
      <router-link class="text-sm font-semibold font-sans sm:hover:text-gray-400" to="login">
        Entrar
      </router-link>
    </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToast } from 'vue-toastification'
import useVuelidate from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'

import TheInput from '../../core/basics/TheInput.vue'
import TheButton from '../../core/basics/TheButton.vue'
import { authService } from '@/services/auth.service'

const forgotForm = ref({ username: null })
const isLoading = ref(false)

const validation = computed(() => ({
  username: {
    required: helpers.withMessage('Nome de usuário é obrigatório', required)
  }
}))

const v$ = useVuelidate(validation, forgotForm)
const toast = useToast()

const sendResetLink = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const valid = await v$.value.$validate()
    if (!valid) return

    await authService.forgotPassword(forgotForm.value.username ?? '')
    toast.success('Se um usuário existir, enviaremos um link de recuperação para o e-mail cadastrado.')
    forgotForm.value.username = null
    v$.value.$reset()
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? error?.message ?? 'Não foi possível enviar o link de recuperação.')
  } finally {
    isLoading.value = false
  }
}
</script>
