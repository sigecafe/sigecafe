<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar } from 'vue-chartjs'

// Registrar plugins
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartDataLabels
)

interface VendasPorEstado {
  estado: string
  totalVendas: number
}

const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Total de Vendas (R$)',
      backgroundColor: '#008000',
      borderRadius: 6,
      data: [] as number[]
    }
  ]
})

// Função para formatar o valor como moeda (BRL)
const formatarParaMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(valor)
}

// Opções do gráfico 
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false, 
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Total de Vendas por Estado',
      padding: { bottom: 50 },
      font: {
        size: 18,
        weight: 'bold' as const
      },
      color: '#000'
    },
    datalabels: {
      anchor: 'end' as const,
      align: 'end' as const,
      color: '#000',
      font: { weight: 'bold' as const, size: 12 },
      formatter: (value: number) => formatarParaMoeda(value)
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            label += formatarParaMoeda(context.parsed.y)
          }
          return label
        }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { display: true }
    },
    y: {
      grid: { display: false },
      ticks: { display: false }
    }
  }
})

const loading = ref(true)

onMounted(async () => {
  try {
    const data = await $fetch<VendasPorEstado[]>('/api/metrics/sales-by-state')

    if (data && Array.isArray(data) && chartData.value.datasets[0]) {
      chartData.value.labels = data.map((item) => item.estado) // ES, MG, etc
      chartData.value.datasets[0].data = data.map((item) => item.totalVendas)
    }

  } catch (error) {
    console.error('Erro ao carregar dados de vendas por estado:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-4 bg-white rounded-2xl shadow w-full h-96">
    <div v-if="loading" class="text-gray-500 text-center">Carregando gráfico de vendas por estado...</div>
    <div v-else-if="!chartData.labels.length" class="text-gray-500 text-center">
      Nenhum dado de vendas por estado encontrado.
    </div>
    <Bar v-else :data="chartData" :options="chartOptions" />
  </div>
</template>