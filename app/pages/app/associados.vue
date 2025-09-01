<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardHeader>
          <UiCardTitle>Associados</UiCardTitle>
          <UiCardDescription>
            Gerencie produtores e compradores associados à cooperativa.
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="mb-4 flex flex-col md:flex-row justify-between gap-4">
            <UiButton @click="openNewAssociadoModal">
              <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
              Novo Associado
            </UiButton>

            <div class="flex flex-col md:flex-row items-center gap-2">
              <div>
                <input
                  v-model="filters.nome"
                  placeholder="Buscar por nome..."
                  class="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <UiSelect v-model="filters.tipo">
                <option value="">Todos os tipos</option>
                <option value="PRODUTOR">Produtor</option>
                <option value="COMPRADOR">Comprador</option>
              </UiSelect>
              <div>
                <input
                  v-model="filters.cidade"
                  placeholder="Cidade..."
                  class="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div>
                <input
                  v-model="filters.estado"
                  placeholder="Estado..."
                  class="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <UiButton variant="outline" @click="fetchAssociados">
                <Icon name="lucide:search" class="h-4 w-4" />
              </UiButton>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>

          <!-- Data table -->
          <div v-else class="rounded-md border">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="associado in associados.data" :key="associado.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ associado.nome }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="{
                        'bg-green-100 text-green-800': associado.tipo === 'PRODUTOR',
                        'bg-blue-100 text-blue-800': associado.tipo === 'COMPRADOR'
                      }">
                      {{ associado.tipo }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ associado.celular || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ associado.cidade ? `${associado.cidade}, ${associado.estado || ''}` : '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button @click="editAssociado(associado)" class="text-indigo-600 hover:text-indigo-900 mr-2">
                      <Icon name="lucide:edit-2" class="h-4 w-4" />
                    </button>
                    <button @click="confirmDelete(associado)" class="text-red-600 hover:text-red-900">
                      <Icon name="lucide:trash-2" class="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                <tr v-if="associados.data.length === 0">
                  <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum associado encontrado
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="mt-4 flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Mostrando página {{ associados.page }} de {{ associados.totalPages }}
            </div>
            <div class="flex gap-2">
              <UiButton
                variant="outline"
                size="sm"
                :disabled="associados.page <= 1"
                @click="changePage(associados.page - 1)"
              >
                Anterior
              </UiButton>
              <UiButton
                variant="outline"
                size="sm"
                :disabled="associados.page >= associados.totalPages"
                @click="changePage(associados.page + 1)"
              >
                Próxima
              </UiButton>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </AppPage>

    <!-- Modal for adding/editing associado -->
    <UiSheet v-model:open="isAssociadoModalOpen" side="right">
      <div class="flex flex-col h-full w-80 sm:w-96">
        <div class="p-4 border-b">
          <h2 class="text-lg font-medium">{{ editingAssociado ? 'Editar Associado' : 'Novo Associado' }}</h2>
        </div>
        <div class="p-4 flex-1 overflow-auto">
          <form @submit.prevent="saveAssociado" class="space-y-4">
            <div v-if="formError" class="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {{ formError }}
            </div>

            <div>
              <label for="nome" class="block text-sm font-medium text-gray-700">Nome*</label>
              <input id="nome" v-model="associadoForm.nome" type="text" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>

            <div>
              <label for="tipo" class="block text-sm font-medium text-gray-700">Tipo*</label>
              <select id="tipo" v-model="associadoForm.tipo" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option value="PRODUTOR">Produtor</option>
                <option value="COMPRADOR">Comprador</option>
              </select>
            </div>

            <div>
              <label for="celular" class="block text-sm font-medium text-gray-700">Celular</label>
              <input id="celular" v-model="associadoForm.celular" type="tel" @input="maskPhoneNumber"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>

            <div>
              <label for="documento" class="block text-sm font-medium text-gray-700">Documento (CPF/CNPJ)</label>
              <input id="documento" v-model="associadoForm.documento" type="text" @input="maskDocument"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>

            <div>
              <label for="endereco" class="block text-sm font-medium text-gray-700">Endereço</label>
              <input id="endereco" v-model="associadoForm.endereco" type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>

            <div>
              <label for="cidade" class="block text-sm font-medium text-gray-700">Cidade</label>
              <input id="cidade" v-model="associadoForm.cidade" type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>

            <div>
              <label for="estado" class="block text-sm font-medium text-gray-700">Estado</label>
              <input id="estado" v-model="associadoForm.estado" type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
          </form>
        </div>
        <div class="p-4 border-t flex justify-end space-x-2">
          <UiButton variant="outline" @click="isAssociadoModalOpen = false">Cancelar</UiButton>
          <UiButton @click="saveAssociado" :disabled="formSubmitting">
            <Icon v-if="formSubmitting" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingAssociado ? 'Atualizar' : 'Salvar' }}
          </UiButton>
        </div>
      </div>
    </UiSheet>

    <!-- Confirmation dialog for delete -->
    <UiAlertDialog v-model:open="isDeleteDialogOpen">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Confirmar exclusão</UiAlertDialogTitle>
          <UiAlertDialogDescription>
            Tem certeza que deseja excluir o associado "{{ associadoToDelete?.nome }}"?
            Esta ação não pode ser desfeita.
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel @click="isDeleteDialogOpen = false">Cancelar</UiAlertDialogCancel>
          <UiAlertDialogAction @click="deleteAssociado" :disabled="deleteSubmitting">
            <Icon v-if="deleteSubmitting" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
            Excluir
          </UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>

<script setup lang="ts">
import type { AssociadoDTO, AssociadoCreateDTO, AssociadoUpdateDTO, AssociadoFilterDTO } from '~/types/api';
import { useUsuarioStore } from '~/stores/UserStore';

const usuarioStore = useUsuarioStore();
const usuario = computed(() => usuarioStore.usuarioPreferences);

// Check if the user is admin or cooperativa
const isAuthorized = computed(() => {
  return usuario.value?.type === 'ADMINISTRADOR' || usuario.value?.type === 'COOPERATIVA';
});

// Redirect if not authorized
onMounted(() => {
  if (!isAuthorized.value) {
    navigateTo('/app');
  }
});

// State for associados listing
const loading = ref(false);
const associados = ref({
  data: [] as AssociadoDTO[],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1
});

// Filter state
const filters = reactive<AssociadoFilterDTO>({
  tipo: undefined,
  nome: '',
  cidade: '',
  estado: '',
  page: 1,
  limit: 10
});

// Modal state for add/edit
const isAssociadoModalOpen = ref(false);
const editingAssociado = ref<AssociadoDTO | null>(null);
const formError = ref('');
const formSubmitting = ref(false);

// Form state
const associadoForm = reactive<AssociadoCreateDTO & AssociadoUpdateDTO>({
  id: 0,
  nome: '',
  tipo: 'PRODUTOR',
  celular: '',
  documento: '',
  endereco: '',
  cidade: '',
  estado: '',
  cooperativaId: 1
});

// Delete confirmation dialog state
const isDeleteDialogOpen = ref(false);
const associadoToDelete = ref<AssociadoDTO | null>(null);
const deleteSubmitting = ref(false);

// Fetch associados with filters
async function fetchAssociados() {
  try {
    loading.value = true;

    // Prepare query parameters
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.nome) queryParams.append('nome', filters.nome);
    if (filters.tipo) queryParams.append('tipo', filters.tipo);
    if (filters.cidade) queryParams.append('cidade', filters.cidade);
    if (filters.estado) queryParams.append('estado', filters.estado);

    const response = await $fetch<any>(`/api/associado?${queryParams.toString()}`);

    associados.value = {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1
    };
  } catch (error) {
    console.error('Error fetching associados:', error);
    // Show error toast or notification
  } finally {
    loading.value = false;
  }
}

// Change page
function changePage(page: number) {
  filters.page = page;
  fetchAssociados();
}

// Reset form for new associado
function resetForm() {
  Object.assign(associadoForm, {
    id: 0,
    nome: '',
    tipo: 'PRODUTOR',
    celular: '',
    documento: '',
    endereco: '',
    cidade: '',
    estado: '',
    cooperativaId: 1
  });
  formError.value = '';
}

// Open modal for new associado
function openNewAssociadoModal() {
  resetForm();
  editingAssociado.value = null;
  isAssociadoModalOpen.value = true;
}

// Open modal for editing
function editAssociado(associado: AssociadoDTO) {
  editingAssociado.value = associado;
  Object.assign(associadoForm, {
    id: associado.id,
    nome: associado.nome,
    tipo: associado.tipo,
    celular: associado.celular || '',
    documento: associado.documento || '',
    endereco: associado.endereco || '',
    cidade: associado.cidade || '',
    estado: associado.estado || '',
    cooperativaId: 1
  });
  isAssociadoModalOpen.value = true;
}

// Form validation
function validateForm(): boolean {
  formError.value = '';

  // Required fields
  if (!associadoForm.nome.trim()) {
    formError.value = 'Nome é obrigatório';
    return false;
  }

  // Phone validation
  if (associadoForm.celular) {
    const phoneDigits = associadoForm.celular.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      formError.value = 'Número de celular inválido. Deve conter 11 dígitos incluindo DDD';
      return false;
    }
  }

  // Document validation (CPF/CNPJ)
  if (associadoForm.documento) {
    const docDigits = associadoForm.documento.replace(/\D/g, '');
    if (docDigits.length !== 11 && docDigits.length !== 14) {
      formError.value = 'Documento inválido. CPF deve ter 11 dígitos e CNPJ 14 dígitos';
      return false;
    }
  }

  return true;
}

// Phone number mask
function maskPhoneNumber(event: Event) {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, ''); // Remove non-digits

  if (value.length <= 11) {
    // Format as (99) 9 9999-9999
    if (value.length > 2) {
      value = '(' + value.substring(0, 2) + ') ' + value.substring(2);
    }
    if (value.length > 10) {
      value = value.substring(0, 10) + ' ' + value.substring(10);
    }
    if (value.length > 15) {
      value = value.substring(0, 15) + '-' + value.substring(15);
    }

    associadoForm.celular = value;
  }
}

// CPF/CNPJ mask
function maskDocument(event: Event) {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, ''); // Remove non-digits

  if (value.length <= 11) {
    // CPF format: 999.999.999-99
    if (value.length > 3) {
      value = value.substring(0, 3) + '.' + value.substring(3);
    }
    if (value.length > 7) {
      value = value.substring(0, 7) + '.' + value.substring(7);
    }
    if (value.length > 11) {
      value = value.substring(0, 11) + '-' + value.substring(11);
    }
  } else {
    // CNPJ format: 99.999.999/0001-99
    if (value.length > 2) {
      value = value.substring(0, 2) + '.' + value.substring(2);
    }
    if (value.length > 6) {
      value = value.substring(0, 6) + '.' + value.substring(6);
    }
    if (value.length > 10) {
      value = value.substring(0, 10) + '/' + value.substring(10);
    }
    if (value.length > 15) {
      value = value.substring(0, 15) + '-' + value.substring(15);
    }
  }

  associadoForm.documento = value;
}

// Save associado
async function saveAssociado() {
  if (!validateForm()) {
    return;
  }

  formSubmitting.value = true;
  formError.value = '';

  try {
    if (editingAssociado.value) {
      // Update existing
      const { id, ...updateData } = associadoForm;
      await $fetch(`/api/associado/${id}`, {
        method: 'PUT',
        body: updateData,
        credentials: 'include'
      });
    } else {
      // Create new
      await $fetch('/api/associado', {
        method: 'POST',
        body: associadoForm,
        credentials: 'include'
      });
    }

    // Close modal and refresh list
    isAssociadoModalOpen.value = false;
    await fetchAssociados();
  } catch (error: any) {
    console.error('Erro ao salvar associado:', error);
    formError.value = error.message || 'Erro ao salvar. Verifique os dados e tente novamente.';
  } finally {
    formSubmitting.value = false;
  }
}

// Open delete confirmation dialog
function confirmDelete(associado: AssociadoDTO) {
  associadoToDelete.value = associado;
  isDeleteDialogOpen.value = true;
}

// Delete associado
async function deleteAssociado() {
  if (!associadoToDelete.value) return;

  deleteSubmitting.value = true;

  try {
    await $fetch(`/api/associado/${associadoToDelete.value.id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    // Close dialog and refresh list
    isDeleteDialogOpen.value = false;
    associadoToDelete.value = null;
    await fetchAssociados();
  } catch (error: any) {
    console.error('Erro ao excluir associado:', error);
    // Could add error handling/notification here
  } finally {
    deleteSubmitting.value = false;
  }
}

// Load initial data
onMounted(() => {
  fetchAssociados();
});
</script>