<template>
  <div>
    <div class="icon-container">
      <SharedLogo />
    </div>
    <UiCardHeader class="header">
      <UiCardTitle class="title">Faça seu Cadastro</UiCardTitle>
      <UiCardDescription>
        <p v-if="auth.step === 'name'">Digite seu nome para começarmos.</p>
        <p v-if="auth.step === 'celular'">Digite seu número de celular para continuar.</p>
        <p v-if="auth.step === 'password'">Digite sua senha para Cadastrar.</p>
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <div v-if="auth.error" class="error-message">
        <p v-html="auth.error"></p>
      </div>
      <form @submit="auth.validateAndProceed">
        <div class="form-grid">
          <AuthInput v-if="auth.step === 'name'" v-model="auth.name" placeholder="Nome Completo" type="text"
            autocomplete="name" :disabled="auth.loading" />
          <AuthInput v-if="auth.step === 'celular'" v-model="auth.celular" placeholder="(99) 9 9999-9999" type="tel"
            autocomplete="tel" maxlength="16" :disabled="auth.loading" @input="$event => auth.maskPhoneNumber($event)" />
          <AuthInput v-if="auth.step === 'password'" v-model="auth.password" placeholder="********" type="password"
            :disabled="auth.loading" />
          <UiButton type="submit" :disabled="auth.loading" class="h-12">
            <Icon name="lucide:loader-2" color="white" v-if="auth.loading" class="mr-2 h-4 w-4 animate-spin" />
            <p v-if="auth.step === 'name'">Continuar</p>
            <p v-if="auth.step === 'celular'">Continuar</p>
            <p v-if="auth.step === 'password'">Cadastrar</p>
          </UiButton>
        </div>
      </form>
    </UiCardContent>
    <UiCardFooter class="footer">
      <p class="footer-text">
        <NuxtLink to="/auth" class="login-link"> Já tenho conta! </NuxtLink>
      </p>
    </UiCardFooter>
  </div>
</template>

<script setup lang="ts">
  import { useAuthStore } from "~/stores/AuthStore";

  const auth = useAuthStore();
  auth.setFormType("signup");
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

  .login-link {
    @apply underline underline-offset-4 hover:text-primary;
  }
</style>
