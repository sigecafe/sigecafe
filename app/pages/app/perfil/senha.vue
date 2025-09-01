<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardContent>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div v-if="error" class="rounded-lg border border-destructive p-3 text-destructive">
              <p>{{ error }}</p>
            </div>

            <div v-if="success" class="rounded-lg border border-success p-3 text-success">
              <p>Senha alterada com sucesso!</p>
            </div>

            <div class="space-y-2">
              <label for="currentPassword" class="text-sm font-medium">Senha Atual</label>
              <AuthInput id="currentPassword" v-model="form.currentPassword" type="password"
                placeholder="Digite sua senha atual" :disabled="loading" />
            </div>

            <div class="space-y-2">
              <label for="newPassword" class="text-sm font-medium">Nova Senha</label>
              <AuthInput id="newPassword" v-model="form.newPassword" type="password" placeholder="Digite sua nova senha"
                :disabled="loading" />
            </div>

            <div class="space-y-2">
              <label for="confirmPassword" class="text-sm font-medium">Confirmar Nova Senha</label>
              <AuthInput id="confirmPassword" v-model="form.confirmPassword" type="password"
                placeholder="Confirme sua nova senha" :disabled="loading" />
            </div>

            <UiButton type="submit" :disabled="loading" class="w-full">
              <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? 'Alterando...' : 'Alterar Senha' }}
            </UiButton>
          </form>
        </UiCardContent>
      </UiCard>
    </AppPage>
  </div>
</template>

<script lang="ts" setup>
  const loading = ref(false)
  const error = ref('')
  const success = ref(false)

  const form = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  async function handleSubmit() {
    error.value = ''
    success.value = false

    // Validações básicas
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      error.value = 'Todos os campos são obrigatórios'
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      error.value = 'As senhas não coincidem'
      return
    }

    if (form.newPassword.length < 3) {
      error.value = 'A nova senha deve ter no mínimo 3  caracteres'
      return
    }

    try {
      loading.value = true

      const response = await $fetch('/api/usuario/trocar-senha', {
        method: 'POST',
        credentials: 'include',
        body: {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        }
      })

      if (!response.success) {
        throw new Error(response.message)
      }

      success.value = true
      form.currentPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''

    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Erro ao alterar senha'
    } finally {
      loading.value = false
    }
  }
</script>