<template>
  <div class="p-6 space-y-6">
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Preços do Café</UiCardTitle>
        <UiCardDescription>Últimos preços Arábica e Robusta</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-lg border p-4">
            <div class="flex items-center gap-2">
              <Icon name="lucide:circle-dollar-sign" class="h-5 w-5 text-primary" />
              <h3 class="font-semibold">Café Arábica</h3>
            </div>
            <p class="mt-2 text-2xl font-bold">R$ {{ latest.arabica.toFixed(2) }}</p>
            <p class="text-sm text-muted-foreground">{{ formatDate(latest.date) }}</p>
          </div>
          <div class="rounded-lg border p-4">
            <div class="flex items-center gap-2">
              <Icon name="lucide:circle-dollar-sign" class="h-5 w-5 text-primary" />
              <h3 class="font-semibold">Café Robusta</h3>
            </div>
            <p class="mt-2 text-2xl font-bold">R$ {{ latest.robusta.toFixed(2) }}</p>
            <p class="text-sm text-muted-foreground">{{ formatDate(latest.date) }}</p>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <UiCard>
      <UiCardHeader class="flex flex-row items-center justify-between pb-2">
        <div>
          <UiCardTitle>Histórico de Preços</UiCardTitle>
          <UiCardDescription>Tendência de preços ao longo do período</UiCardDescription>
        </div>
        <div class="flex items-center space-x-2">
          <button
            class="px-3 py-1 text-sm rounded-md transition-colors"
            :class="period === 'month' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'"
            @click="setPeriod('month')"
          >
            Mês
          </button>
          <button
            class="px-3 py-1 text-sm rounded-md transition-colors"
            :class="period === 'year' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'"
            @click="setPeriod('year')"
          >
            Ano
          </button>
        </div>
      </UiCardHeader>
      <UiCardContent class="p-0 mx-[-20px] mb-[50px]">
        <!-- Area Chart -->
        <div style="height: 350px; width: 100%" class="z-10">
          <UiChartArea :data="chartData" :categories="chartCategories" :index="chartIndex"
            :colors="['#c0c0c0', '#09090b']" :names="['Arábica', 'Robusta']" :axis="{
              x: {
                type: 'datetime',
                tickAmount: 6,
                labels: {
                  datetimeUTC: false,
                  formatter: function(value: number) {
                    const date = new Date(value);
                    return date.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit'
                    });
                  }
                }
              },
              y: {
                min: 0,
                tickAmount: 6,
                decimalsInFloat: 0,
                forceNiceScale: true
              }
            }"
            :show-legend="false"
            :show-x-axis="false"
            :show-y-axis="false"
            :grid="{
              show: true,
              borderColor: '#e5e7eb',
              strokeDashArray: 4,
              position: 'back'
            }" :chart="{
              toolbar: {
                show: false
              },
              zoom: {
                enabled: true
              },
              fontFamily: 'inherit'
            }" :stroke="{
              curve: 'smooth',
              width: 2
            }" :fill="{
              type: 'gradient',
              gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.9,
                stops: [0, 90, 100]
              }
            }" :custom-tooltip="ChartTooltip" />
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent, watch } from 'vue'
import type { PrecoCafeDTO } from '~/types/api'
import { formatDate } from '~/utils'

const ChartTooltip = defineAsyncComponent(() => import('~/components/Ui/Chart/ChartTooltip.vue'))

const latest = ref<{ arabica: number; robusta: number; date: Date }>({ arabica: 0, robusta: 0, date: new Date() })
const history = ref<PrecoCafeDTO[]>([])
const priceError = ref<string | null>(null)
const period = ref<'month' | 'year'>('year') // Default to year view

// Chart colors
const chartColors = ['#4CAF50', '#FF9800']

// Chart data computations
const chartData = computed(() => {
  if (!history.value.length) return [];

  // Sort the history by date, oldest first
  return history.value
    .slice()
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .map((item) => {
      // Make sure we have a valid date
      const date = new Date(item.data);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', item.data);
        // Skip invalid dates by returning a valid shape with default values
        return {
          date: 0,
          arabica: 0,
          robusta: 0
        };
      }

      return {
        date: date.getTime(),
        arabica: item.precoArabica ?? 0,
        robusta: item.precoRobusta ?? 0
      };
    })
    .filter(item => item.date !== 0); // Filter out invalid dates
})

// Explicit types for chart configuration
type ChartCategory = 'arabica' | 'robusta'
type ChartIndex = 'date'

const chartCategories = computed<ChartCategory[]>(() => ['arabica', 'robusta'])
const chartIndex = computed<ChartIndex>(() => 'date')

async function fetchLatest() {
  try {
    const res = await $fetch<{ success: boolean; data: { arabica: number; robusta: number; date: string } }>('/api/coffee-prices', { credentials: 'include' })
    if (res.success) {
      latest.value = { arabica: res.data.arabica, robusta: res.data.robusta, date: new Date(res.data.date) }
    } else {
      priceError.value = 'Falha ao buscar preços mais recentes'
    }
  } catch (e: any) {
    priceError.value = e.message || 'Erro ao buscar preços mais recentes'
  }
}

async function fetchHistory() {
  try {
    const res = await $fetch<{ success: boolean; data: PrecoCafeDTO[] }>('/api/coffee-prices/history', {
      credentials: 'include',
      query: {
        period: period.value
      }
    })
    if (res.success) history.value = res.data
  } catch (e) {
    console.error('Erro ao buscar histórico de preços:', e)
  }
}

function setPeriod(newPeriod: 'month' | 'year') {
  period.value = newPeriod
  fetchHistory()
}

watch(period, () => {
  fetchHistory()
})

onMounted(async () => {
  await fetchLatest()
  await fetchHistory()
})
</script>