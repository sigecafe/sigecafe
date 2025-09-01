<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardHeader>
          <UiCardTitle>Gerenciamento de Permissões</UiCardTitle>
          <UiCardDescription>
            Gerencie permissões e papéis de usuários do sistema
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <UiTabs defaultValue="usuarios" class="w-full">
            <UiTabsList class="grid w-full grid-cols-3">
              <UiTabsTrigger value="usuarios">Usuários</UiTabsTrigger>
              <UiTabsTrigger value="papeis">Papéis</UiTabsTrigger>
              <UiTabsTrigger value="api">API Endpoints</UiTabsTrigger>
            </UiTabsList>

            <UiTabsContent value="usuarios">
              <div class="space-y-4 py-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-medium">Lista de Usuários</h3>
                  <UiInput
                    v-model="userSearchQuery"
                    placeholder="Buscar usuário..."
                    class="w-64"
                  />
                </div>

                <div class="rounded-md border">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Papel Atual</th>
                        <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-if="loading">
                        <td colspan="4" class="px-6 py-4 text-center">
                          <Icon name="lucide:loader-2" class="h-5 w-5 animate-spin mx-auto" />
                        </td>
                      </tr>
                      <tr v-else-if="filteredUsers.length === 0">
                        <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                          Nenhum usuário encontrado
                        </td>
                      </tr>
                      <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {{ user.name }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ user.email }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            class="px-2 py-1 text-xs rounded-full"
                            :class="{
                              'bg-red-100 text-red-800': user.type === 'ADMINISTRADOR',
                              'bg-blue-100 text-blue-800': user.type === 'COOPERATIVA',
                              'bg-green-100 text-green-800': user.type === 'PRODUTOR',
                              'bg-purple-100 text-purple-800': user.type === 'COMPRADOR',
                              'bg-gray-100 text-gray-800': user.type === 'AUTENTICADO',
                            }"
                          >
                            {{ user.type }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <UiButton variant="outline" size="sm" @click="openEditUserRoleModal(user)">
                            <Icon name="lucide:pencil" class="h-4 w-4 mr-1" />
                            Editar
                          </UiButton>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </UiTabsContent>

            <UiTabsContent value="papeis">
              <div class="space-y-4 py-4">
                <h3 class="text-lg font-medium">Papéis do Sistema</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UiCard v-for="role in roles" :key="role.name">
                    <UiCardHeader>
                      <UiCardTitle>{{ role.displayName }}</UiCardTitle>
                      <UiCardDescription>{{ role.description }}</UiCardDescription>
                    </UiCardHeader>
                    <UiCardContent>
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-for="perm in role.permissions"
                          :key="perm"
                          class="px-2 py-1 text-xs bg-gray-100 rounded-full"
                        >
                          {{ perm }}
                        </span>
                      </div>
                    </UiCardContent>
                  </UiCard>
                </div>
              </div>
            </UiTabsContent>

            <UiTabsContent value="api">
              <AppDynamicTabs tabs-folder="Permissoes" defaultTab="Api" :tabs="['Api']" />
            </UiTabsContent>
          </UiTabs>
        </UiCardContent>
      </UiCard>
    </AppPage>

    <!-- Modal para editar papel de usuário -->
    <UiSheet v-model:open="isEditUserRoleOpen" side="right">
      <div class="flex flex-col h-full w-80 sm:w-96">
        <div class="p-4 border-b">
          <h2 class="text-lg font-medium">Editar Papel do Usuário</h2>
        </div>
        <div class="p-4 flex-1 overflow-auto">
          <div v-if="selectedUser" class="space-y-4">
            <p><strong>Usuário:</strong> {{ selectedUser.name }}</p>
            <p><strong>Email:</strong> {{ selectedUser.email }}</p>

            <div class="space-y-2">
              <label for="userRole" class="text-sm font-medium">Papel</label>
              <select
                id="userRole"
                v-model="selectedRole"
                class="w-full rounded-md border border-input px-3 py-2"
              >
                <option v-for="role in roles" :key="role.name" :value="role.name">
                  {{ role.displayName }}
                </option>
              </select>
            </div>

            <div v-if="roleUpdateError" class="rounded-lg border border-destructive p-3 text-destructive">
              <p>{{ roleUpdateError }}</p>
            </div>
          </div>
        </div>
        <div class="p-4 border-t flex justify-end space-x-2">
          <UiButton variant="outline" @click="isEditUserRoleOpen = false">Cancelar</UiButton>
          <UiButton
            @click="updateUserRole"
            :disabled="roleUpdateLoading"
          >
            <Icon v-if="roleUpdateLoading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
            Salvar
          </UiButton>
        </div>
      </div>
    </UiSheet>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';

interface User {
  id: number;
  name: string;
  email: string | null;
  type: string;
}

// Estado
const loading = ref(false);
const users = ref<User[]>([]);
const userSearchQuery = ref('');
const isEditUserRoleOpen = ref(false);
const selectedUser = ref<User | null>(null);
const selectedRole = ref('');
const roleUpdateLoading = ref(false);
const roleUpdateError = ref('');

// Papéis do sistema
const roles = [
  {
    name: 'ADMINISTRADOR',
    displayName: 'Administrador',
    description: 'Acesso completo ao sistema',
    permissions: ['users:manage', 'cooperativa:manage', 'transactions:manage', 'reports:manage', 'permissions:manage']
  },
  {
    name: 'COOPERATIVA',
    displayName: 'Cooperativa',
    description: 'Gerencia associados e colaboradores',
    permissions: ['associados:manage', 'colaboradores:manage', 'transactions:view']
  },
  {
    name: 'PRODUTOR',
    displayName: 'Produtor',
    description: 'Vende café e visualiza transações',
    permissions: ['transactions:participate', 'prices:view']
  },
  {
    name: 'COMPRADOR',
    displayName: 'Comprador',
    description: 'Compra café e visualiza transações',
    permissions: ['transactions:participate', 'prices:view']
  },
  {
    name: 'AUTENTICADO',
    displayName: 'Autenticado',
    description: 'Acesso básico ao sistema',
    permissions: ['profile:view', 'profile:edit']
  }
];

// Usuarios filtrados
const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return users.value;

  const query = userSearchQuery.value.toLowerCase();
  return users.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    (user.email && user.email.toLowerCase().includes(query))
  );
});

// Carregar usuários
async function loadUsers() {
  loading.value = true;

  try {
    const response = await $fetch<any>('/api/permissoes/usuarios', {
      credentials: 'include'
    });

    if (response && (Array.isArray(response) || (response.data && Array.isArray(response.data)))) {
      users.value = Array.isArray(response) ? response : response.data;
    }
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    // Dados de exemplo para desenvolvimento
    users.value = [
      { id: 1, name: 'Admin Sistema', email: 'admin@example.com', type: 'ADMINISTRADOR' },
      { id: 2, name: 'Cooperativa Café Sul', email: 'coop@cafesul.com', type: 'COOPERATIVA' },
      { id: 3, name: 'João Produtor', email: 'joao@exemplo.com', type: 'PRODUTOR' },
      { id: 4, name: 'Maria Compradora', email: 'maria@exemplo.com', type: 'COMPRADOR' },
      { id: 5, name: 'Novo Usuário', email: 'novo@exemplo.com', type: 'AUTENTICADO' }
    ];
  } finally {
    loading.value = false;
  }
}

// Abrir modal de edição
function openEditUserRoleModal(user: User): void {
  selectedUser.value = user;
  selectedRole.value = user.type;
  roleUpdateError.value = '';
  isEditUserRoleOpen.value = true;
}

// Atualizar papel do usuário
async function updateUserRole(): Promise<void> {
  if (!selectedUser.value || !selectedRole.value) return;

  roleUpdateLoading.value = true;
  roleUpdateError.value = '';

  try {
    const userId = selectedUser.value.id;
    await $fetch(`/api/permissoes/usuario/${userId}`, {
      method: 'PUT',
      body: { type: selectedRole.value },
      credentials: 'include'
    });

    // Atualizar a lista local
    const index = users.value.findIndex(u => u.id === userId);
    if (index !== -1 && index < users.value.length) {
      const user = users.value[index];
      if (user) {
        user.type = selectedRole.value;
      }
    }

    isEditUserRoleOpen.value = false;
  } catch (error) {
    console.error('Erro ao atualizar papel do usuário:', error);
    roleUpdateError.value = 'Falha ao atualizar o papel do usuário';
  } finally {
    roleUpdateLoading.value = false;
  }
}

// Carregar dados ao montar
onMounted(() => {
  loadUsers();
});
</script>
