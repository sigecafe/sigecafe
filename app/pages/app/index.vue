<template>
  <div>
    <div v-if="usuario?.type === 'AUTENTICADO'">
      <SharedMsgWarning title="Cadastro Pendente"
        description="Por favor, entre em contato com a cooperativa para finalizar seu cadastro e liberar o acesso completo ao sistema." />
    </div>

    <div v-else>

        <UiCard class="mt-10 mb-6">
          <UiCardHeader>
            <UiCardTitle>Bem-vindo {{ usuario?.name }}</UiCardTitle>
            <UiCardDescription>
              Acompanhe em tempo real o preço do café
            </UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <!-- Quick Stats -->
              <div class="rounded-lg border p-4">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:circle-dollar-sign" class="h-5 w-5 text-primary" />
                  <h3 class="font-semibold">Café Arábica</h3>
                </div>
                <p class="mt-2 text-2xl font-bold">R$ {{ latestCoffeePrices.arabica.toFixed(2) }}</p>
                <p class="text-sm text-muted-foreground">{{ formatDate(latestCoffeePrices.date) }}</p>
              </div>

              <div class="rounded-lg border p-4">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:circle-dollar-sign" class="h-5 w-5 text-primary" />
                  <h3 class="font-semibold">Café Robusta</h3>
                </div>
                <p class="mt-2 text-2xl font-bold">R$ {{ latestCoffeePrices.robusta.toFixed(2) }}</p>
                <p class="text-sm text-muted-foreground">{{ formatDate(latestCoffeePrices.date) }}</p>
              </div>

              <div class="rounded-lg border p-4">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:shopping-bag" class="h-5 w-5 text-primary" />
                  <h3 class="font-semibold">Transações</h3>
                </div>
                <p class="mt-2 text-2xl font-bold">{{ transacoesPendentes }}</p>
                <p class="text-sm text-muted-foreground">transações pendentes</p>
              </div>
            </div>
          </UiCardContent>
        </UiCard>

        <!-- Ações Rápidas -->
        <div v-if="usuario?.type === 'ADMINISTRADOR' || usuario?.type === 'COOPERATIVA' || usuario?.type === 'PRODUTOR' || usuario?.type === 'COMPRADOR'">
          <UiCard class="mb-6">
            <UiCardHeader>
              <UiCardTitle>Clima em {{ cidadeCooperativa }}</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <UiButton variant="outline" class="h-32 flex-col gap-2 text-center whitespace-nowrap items-center justify-center">
                  <Icon name="lucide:thermometer" class="h-6 w-6" />
                  <span class="text-sm">Temperatura</span>
                  <span class="text-sm">{{ weatherStore.weatherData?.hourly?.temperature2m }}°C</span>
                </UiButton>

                <UiButton variant="outline" class="h-32 flex-col gap-2 text-center whitespace-nowrap items-center justify-center">
                  <Icon name="lucide:droplets" class="h-6 w-6" />
                  <span class="text-sm">Humidade</span>
                  <span class="text-sm">{{ weatherStore.weatherData?.hourly?.relativeHumidity2m }} %</span>
                </UiButton>

                <UiButton variant="outline" class="h-32 flex-col gap-2 text-center whitespace-nowrap items-center justify-center">
                  <Icon name="lucide:cloud-hail" class="h-6 w-6" />
                  <span class="text-sm">Precipitação</span>
                  <span class="text-sm">{{ weatherStore.weatherData?.hourly?.precipitation }} mm</span>
                </UiButton>

                <UiButton variant="outline" class="h-32 flex-col gap-2 text-center whitespace-nowrap items-center justify-center">
                  <Icon name="lucide:percent" class="h-6 w-6" />
                  <span class="text-sm">Chance de Precipitação</span>
                  <span class="text-sm">{{ weatherStore.weatherData?.hourly?.precipitationProbability }} %</span>
                </UiButton>
              </div>
            </UiCardContent>
          </UiCard>
        </div>

        <!-- Quadro de Avisos -->
        <UiCard>
          <UiCardHeader>
            <UiCardTitle>Quadro de Avisos</UiCardTitle>
            <UiCardDescription>
              Últimas atualizações do seu negócio
            </UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <div class="space-y-4">
              <div v-for="atividade in atividadesRecentes" :key="atividade.id"
                class="flex items-center gap-4 rounded-lg border p-4">
                <Icon :name="atividade.icon" class="h-5 w-5 text-primary" />
                <div class="flex-1">
                  <p class="font-medium">{{ atividade.titulo }}</p>
                  <p class="text-sm text-muted-foreground">{{ atividade.descricao }}</p>
                </div>
                <time class="text-sm text-muted-foreground">{{ atividade.data }}</time>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
      </div>
    </div>

</template>

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { useUsuarioStore } from '../../stores/UserStore';
  import { useWeatherStore } from '../../stores/WeatherStore';

  interface CoffeePriceData {
    arabica: number;
    robusta: number;
    date: Date;
  }

  interface CoffeePriceResponse {
    success: boolean;
    data?: CoffeePriceData;
    message?: string;
  }

  interface Atividade {
    id: number;
    icon: string;
    titulo: string;
    descricao: string;
    data: string;
  }

  const usuarioStore = useUsuarioStore();
  const weatherStore = useWeatherStore();
  const usuario = computed(() => usuarioStore.usuarioPreferences);

  // City data
  const cidade = ref('São Paulo');

  // Fetch location data
  async function fetchCidadeInfo() {
    console.log('Fetching location data...');
    try {
      const { cooperativaId, cidade: userCidade, estadoId } = usuario.value || {};
      console.log('User data:', { cooperativaId, cidade: userCidade, estadoId });

      // Check if user already has cidade information
      if (userCidade) {
        cidade.value = userCidade;
        console.log('Updated city to:', cidade.value, 'from user data');
        localStorage.setItem('userCidade', cidade.value);
        return;
      }
      // Try cooperativa if no city from associado
      if (cooperativaId) {
        try {
          console.log('Fetching cooperativa data...');
          const res = await fetch(`/api/cooperativa/${cooperativaId}`, { credentials: 'include' });
          if (res.ok) {
            const json = await res.json();
            console.log('Received cooperativa data:', json);
            if (json.success && json.data && json.data.cidade) {
              cidade.value = json.data.cidade;
              console.log('Updated city to:', cidade.value, 'from cooperativa');
              localStorage.setItem('userCidade', cidade.value);
              return;
            }
          }
        } catch (e) {
          console.error('Error fetching cooperativa data:', e);
        }
      }
    } catch (e) {
      console.error('Error determining location:', e);
    }
  }

  // Use computed for display with localStorage fallback
  const cidadeCooperativa = computed(() => {
    if (cidade.value !== 'São Paulo') {
      return cidade.value;
    }
    // Try to get from localStorage if initial value hasn't changed
    const storedCity = localStorage.getItem('userCidade');
    if (storedCity) {
      cidade.value = storedCity;
      return storedCity;
    }
    return cidade.value;
  });

  // Coffee prices state
  const coffeePricesData = ref({
    arabica: 0,
    robusta: 0,
    date: new Date()
  });
  const loadingPrices = ref(false);
  const priceError = ref<string | null>(null);

  const latestCoffeePrices = computed(() => coffeePricesData.value);

  // Format date for display
  function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  async function fetchCoffeePrices() {
    loadingPrices.value = true;
    priceError.value = null;

    try {
      const response: any = await $fetch('/api/coffee-prices', {
        credentials: 'include'
      });

      if (response?.success && response?.data) {
        // Ensure we have valid numbers
        coffeePricesData.value = {
          arabica: Number(response.data.arabica) || 0,
          robusta: Number(response.data.robusta) || 0,
          date: new Date(response.data.date)
        };
      } else {
        throw new Error(response?.message || 'Failed to fetch coffee prices');
      }
    } catch (error: unknown) {
      console.error('Error fetching coffee prices:', error);
      priceError.value = error instanceof Error ? error.message : 'Failed to fetch coffee prices';

      coffeePricesData.value = {
        arabica: 31.20,
        robusta: 25.59,
        date: new Date()
      };
    } finally {
      loadingPrices.value = false;
    }
  }

  const notificacoesPendentes = ref(5);
  const transacoesPendentes = ref(3);

  const atividadesRecentes = ref<Atividade[]>([
    {
      id: 1,
      icon: 'lucide:move-up',
      titulo: 'Venda para empresa "xxx" autorizada!',
      descricao: '350 sacas de café prontas para envio',
      data: 'Há 5 min'
    },
    {
      id: 2,
      icon: 'lucide:triangle-alert',
      titulo: 'Aviso!',
      descricao: 'Tempestade prevista para sua região!',
      data: 'Há 30 min'
    },
    {
      id: 3,
      icon: 'lucide:move-up',
      titulo: 'Venda para empresa "xxx" autorizada!',
      descricao: '350 sacas de café prontas para envio',
      data: 'Há 1h'
    }
  ]);

  onMounted(async () => {
    // Try to get from localStorage first
    const storedCity = localStorage.getItem('userCidade');
    if (storedCity) {
      cidade.value = storedCity;
      console.log('Loaded city from localStorage:', cidade.value);
    }

    // Then fetch data as needed
    try {
      await weatherStore.fetchWeather();
      await fetchCoffeePrices();
      await fetchCidadeInfo();
    } catch (error) {
      console.error('Error in onMounted:', error);
    }
  });
</script>