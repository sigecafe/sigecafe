<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardHeader>
          <UiCardTitle>Meu Perfil</UiCardTitle>
          <UiCardDescription>
            Atualize suas informações pessoais
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div v-if="usuarioStore.loading" class="flex justify-center py-4">
            <Icon name="lucide:loader-2" class="h-6 w-6 animate-spin" />
          </div>

          <form v-else @submit.prevent="handleSubmit" class="space-y-4">
            <div v-if="error" class="rounded-lg border border-destructive p-3 text-destructive">
              <p>{{ error }}</p>
            </div>

            <div v-if="success" class="rounded-lg border border-green-500 bg-green-50 p-3 text-green-600">
              <p>Perfil atualizado com sucesso!</p>
            </div>

            <div class="space-y-2">
              <label for="name" class="text-sm font-medium">Nome Completo <span class="text-red-500">*</span></label>
              <AuthInput
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Digite seu nome completo"
                :disabled="loading"
                :class="{ 'border-red-500 focus:border-red-500': nameError }"
              />
              <p v-if="nameError" class="text-xs text-red-500 mt-1">{{ nameError }}</p>
            </div>

            <div class="space-y-2">
              <label for="email" class="text-sm font-medium">Email <span class="text-red-500">*</span></label>
              <AuthInput
                id="email"
                v-model="form.email"
                type="email"
                placeholder="Digite seu email"
                :disabled="loading"
                :class="{ 'border-red-500 focus:border-red-500': emailError }"
              />
              <p v-if="emailError" class="text-xs text-red-500 mt-1">{{ emailError }}</p>
            </div>

            <div class="space-y-2">
              <label for="celular" class="text-sm font-medium">Celular</label>
              <AuthInput
                id="celular"
                v-model="form.celular"
                type="tel"
                placeholder="(99) 9 9999-9999"
                :disabled="loading"
                @input="maskPhoneNumber"
                maxlength="16"
                :class="{ 'border-red-500 focus:border-red-500': celularError }"
              />
              <p v-if="celularError" class="text-xs text-red-500 mt-1">{{ celularError }}</p>
            </div>

            <div class="flex justify-between gap-4">
              <UiButton type="submit" :disabled="loading" class="flex-1">
                <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
              </UiButton>
            </div>
          </form>
        </UiCardContent>
      </UiCard>
    </AppPage>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useUsuarioStore } from '~/stores/UserStore';

  const loading = ref(false);
  const error = ref('');
  const success = ref(false);
  const nameError = ref('');
  const emailError = ref('');
  const celularError = ref('');

  const usuarioStore = useUsuarioStore();

  const form = reactive({
    name: '',
    email: '',
    celular: ''
  });

  // Carrega os dados iniciais apenas se estiver autenticado
  onMounted(async () => {
    try {
      const usuario = await usuarioStore.fetchUsuarioPreferences();
      form.name = usuario.name;
      form.email = usuario.email || '';
      form.celular = usuario.celular || '';
    } catch (err) {
      error.value = 'Erro ao carregar dados do perfil. Tente novamente.';
      console.error('Error loading profile data:', err);
    }
  });

  function resetErrors() {
    error.value = '';
    nameError.value = '';
    emailError.value = '';
    celularError.value = '';
  }

  function maskPhoneNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d{1})(\d{4})(\d{4}).*/, '($1) $2 $3-$4');
      form.celular = value;
    }
  }

  function isValidPhone(phone: string) {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11;
  }

  function isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function handleSubmit() {
    resetErrors();
    success.value = false;

    // Field-specific validation
    let hasError = false;

    if (!form.name.trim()) {
      nameError.value = 'Nome é obrigatório';
      hasError = true;
    }

    if (!form.email.trim()) {
      emailError.value = 'Email é obrigatório';
      hasError = true;
    } else if (!isValidEmail(form.email)) {
      emailError.value = 'Email inválido';
      hasError = true;
    }

    if (form.celular && !isValidPhone(form.celular)) {
      celularError.value = 'Número de celular inválido. Deve conter 11 dígitos incluindo DDD';
      hasError = true;
    }

    if (hasError) return;

    try {
      loading.value = true;

      const response = await $fetch('/api/usuario/perfil', {
        method: 'PUT',
        credentials: 'include',
        body: {
          name: form.name,
          email: form.email,
          celular: form.celular
        }
      });

      if (!response.success) {
        throw new Error(response.message || 'Falha ao atualizar o perfil');
      } else {
        // Atualiza os dados no store
        await usuarioStore.fetchUsuarioPreferences(); // Reload fresh data
        success.value = true;

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          success.value = false;
        }, 3000);
      }
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);

      // Handle specific error cases
      if (err.data?.code === 'EMAIL_ALREADY_EXISTS') {
        emailError.value = 'Este email já está sendo usado por outro usuário';
      } else if (err.data?.code === 'INVALID_EMAIL') {
        emailError.value = 'Email inválido';
      } else {
        error.value = err.data?.message || err.message || 'Erro ao atualizar perfil';
      }
    } finally {
      loading.value = false;
    }
  }
</script>