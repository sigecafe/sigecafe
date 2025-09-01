<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardHeader>
          <UiCardTitle class="flex justify-between items-center">
            <span>Notificações</span>
            <div class="flex gap-2">
              <UiButton v-if="hasUnread" size="sm" variant="outline" @click="marcarTodasComoLidas">
                <Icon name="lucide:check" class="h-4 w-4 mr-1" />
                Marcar todas como lidas
              </UiButton>
              <UiButton size="sm" variant="outline" @click="fetchNotificacoes">
                <Icon name="lucide:refresh-cw" class="h-4 w-4 mr-1" />
                Atualizar
              </UiButton>
            </div>
          </UiCardTitle>
          <UiCardDescription>
            Acompanhe suas notificações e atualizações
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <Icon name="lucide:loader-2" class="animate-spin h-8 w-8 text-primary" />
          </div>
          <div v-else class="space-y-4">
            <div v-if="notificacoes.length === 0" class="text-center py-8">
              <Icon name="lucide:bell-off" class="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p class="text-muted-foreground">Nenhuma notificação encontrada</p>
            </div>
            <div v-for="notificacao in notificacoes" :key="notificacao.id"
              class="flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors"
              :class="{'bg-primary/5 hover:bg-primary/10': !notificacao.lida, 'hover:bg-gray-50': notificacao.lida}"
              @click="marcarComoLida(notificacao)">
              <div class="relative">
                <Icon :name="notificacao.icon || 'lucide:bell'" class="h-6 w-6 text-primary" />
                <div v-if="!notificacao.lida" class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></div>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <p class="font-medium">{{ notificacao.titulo }}</p>
                  <time class="text-xs text-muted-foreground">{{ formatDate(notificacao.createdAt) }}</time>
                </div>
                <p class="text-sm text-muted-foreground mt-1">{{ notificacao.descricao }}</p>
              </div>
            </div>

            <div v-if="notificacoes.length > 0 && hasMore" class="flex justify-center mt-4">
              <UiButton variant="outline" size="sm" @click="loadMore" :disabled="isLoadingMore">
                <Icon v-if="isLoadingMore" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Carregar mais
              </UiButton>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </AppPage>
  </div>
</template>


<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import type { NotificacaoDTO } from '~/types/api';

  const notificacoes = ref<NotificacaoDTO[]>([]);
  const isLoading = ref(true);
  const isLoadingMore = ref(false);
  const page = ref(1);
  const limit = ref(10);
  const totalCount = ref(0);
  const updateSuccess = ref(false);

  // Computed property to check if there are any unread notifications
  const hasUnread = computed(() => notificacoes.value.some(n => !n.lida));

  // Computed property to check if there are more notifications to load
  const hasMore = computed(() => notificacoes.value.length < totalCount.value);

  // Format date for display
  function formatDate(date: string | Date): string {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000); // Difference in seconds

    if (diff < 60) {
      return 'agora';
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    } else if (diff < 604800) {
      const days = Math.floor(diff / 86400);
      return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
    } else {
      return d.toLocaleDateString('pt-BR');
    }
  }

  // Função para buscar notificações
  async function fetchNotificacoes() {
    isLoading.value = true;
    page.value = 1;

    try {
      const response = await $fetch<any>(`/api/notificacao?page=${page.value}&limit=${limit.value}`, {
        credentials: 'include'
      });

      if (response && response.data) {
        notificacoes.value = response.data;
        totalCount.value = response.total || 0;
      } else {
        // Fallback para desenvolvimento
        notificacoes.value = [
          {
            id: '1',
            titulo: 'Nova transação registrada',
            descricao: 'Uma nova venda de 10 sacas de café foi registrada.',
            icon: 'lucide:shopping-cart',
            lida: false,
            enviada: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
            updatedAt: new Date()
          },
          {
            id: '2',
            titulo: 'Atualização de preço',
            descricao: 'O preço do café Arábica foi atualizado para R$ 950,00 por saca.',
            icon: 'lucide:trending-up',
            lida: true,
            enviada: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 horas atrás
            updatedAt: new Date()
          },
          {
            id: '3',
            titulo: 'Alerta climático',
            descricao: 'Previsão de chuvas intensas para os próximos dias em sua região.',
            icon: 'lucide:cloud-rain',
            lida: false,
            enviada: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
            updatedAt: new Date()
          }
        ];
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      isLoading.value = false;
    }
  }

  // Função para carregar mais notificações
  async function loadMore() {
    if (isLoadingMore.value || !hasMore.value) return;

    isLoadingMore.value = true;
    page.value++;

    try {
      const response = await $fetch<any>(`/api/notificacao?page=${page.value}&limit=${limit.value}`, {
        credentials: 'include'
      });

      if (response && response.data) {
        notificacoes.value = [...notificacoes.value, ...response.data];
      }
    } catch (error) {
      console.error('Erro ao carregar mais notificações:', error);
      page.value--; // Reverter para tentar novamente
    } finally {
      isLoadingMore.value = false;
    }
  }

  // Função para marcar notificação como lida
  async function marcarComoLida(notificacao: NotificacaoDTO) {
    if (notificacao.lida) return;

    try {
      await $fetch('/api/notificacao/marcar-lida', {
        method: 'PUT',
        body: { id: notificacao.id },
        credentials: 'include'
      });

      // Atualizar o status de leitura localmente
      const index = notificacoes.value.findIndex(n => n.id === notificacao.id);
      if (index !== -1 && notificacoes.value[index]) {
        notificacoes.value[index].lida = true;
      }

      updateSuccess.value = true;
      setTimeout(() => {
        updateSuccess.value = false;
      }, 3000);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }

  // Função para marcar todas as notificações como lidas
  async function marcarTodasComoLidas() {
    try {
      await $fetch('/api/notificacao/marcar-todas-lidas', {
        method: 'PUT',
        credentials: 'include'
      });

      // Atualizar o status de leitura de todas as notificações localmente
      notificacoes.value = notificacoes.value.map(n => ({
        ...n,
        lida: true
      }));

      updateSuccess.value = true;
      setTimeout(() => {
        updateSuccess.value = false;
      }, 3000);
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  }

  // Buscar notificações ao montar o componente
  onMounted(fetchNotificacoes);
</script>