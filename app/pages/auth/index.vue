<template>
  <div>
    <div class="icon-container">
      <SharedLogo />
    </div>
    <UiCardHeader class="header">
      <UiCardTitle class="title">Faça seu Login</UiCardTitle>
      <UiCardDescription>
        <p v-if="auth.step === 'celular'">Digite seu número de celular para continuar.</p>
        <p v-if="auth.step === 'celular'" class="text-xs text-gray-500">Formato: (11) 9 9999-0001</p>
        <p v-if="auth.step === 'password'">Digite sua senha para Entrar.</p>
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <div v-if="auth.error" class="error-message">
        <p v-html="auth.error"></p>
      </div>
      <form @submit="auth.validateAndProceed">
        <div class="form-grid">

          <AuthInput v-if="auth.step === 'celular'" :key="'celular-input'" v-model="auth.celular" model-name="celular"
            placeholder="(99) 9 9999-9999" type="tel" autocomplete="tel" maxlength="16" :disabled="auth.loading"
            v-phone-mask @update:modelValue="sanitizePhone" />

          <AuthInput v-if="auth.step === 'password'" :key="'password-input'" v-model="auth.password"
            model-name="password" placeholder="********" type="password" :disabled="auth.loading" />
          <UiButton type="submit" :disabled="auth.loading" class="submit-button">
            <Icon name="lucide:loader-2" color="white" v-if="auth.loading" class="loading-icon" />
            <p v-if="auth.step === 'celular'">Continuar</p>
            <p v-if="auth.step === 'password'">Entrar</p>
          </UiButton>
        </div>
      </form>
    </UiCardContent>
    <UiCardFooter class="footer">
      <p class="footer-text">
        <NuxtLink data-testid="signup-link" to="/auth/signup" class="register-link"> Cadastre-se </NuxtLink>
      </p>
    </UiCardFooter>
  </div>
</template>

<script setup lang="ts">
  import { useAuthStore } from "~/stores/AuthStore";
  import { formatPhoneNumber, getPhoneDigits } from "~/utils/phoneUtils";

  const auth = useAuthStore();
  auth.setFormType("auth");

  // Extra validation to ensure phone numbers are properly formatted
  function sanitizePhone(value: string) {
    if (value) {
      const digits = getPhoneDigits(value);
      const limitedDigits = digits.substring(0, 11);
      // Make sure the store has a properly formatted value
      auth.celular = formatPhoneNumber(limitedDigits);
    }
  }
</script>

<style scoped>
  .icon-container {
    @apply flex items-center justify-center;
  }

  .icon {
    @apply h-16 w-16 text-green-600;
  }

  .header {
    @apply flex flex-col space-y-4 text-center;
  }

  .title {
    @apply text-2xl;
  }

  .error-message {
    @apply mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-600;
    @apply dark:bg-red-900/30 dark:text-red-400;
  }

  .form-grid {
    @apply grid w-full items-center gap-4;
  }

  .submit-button {
    @apply h-12;
  }

  .loading-icon {
    @apply mr-2 h-4 w-4 animate-spin;
  }

  .footer {
    @apply text-center text-sm text-muted-foreground;
  }

  .footer-text {
    @apply w-full;
  }

  .register-link {
    @apply underline underline-offset-4 hover:text-primary;
  }
</style>
