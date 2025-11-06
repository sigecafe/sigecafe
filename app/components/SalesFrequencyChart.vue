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

const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Número de Vendas',
      backgroundColor: '#008000',
      borderRadius: 6,
      data: [] as number[]
    }
  ]
})

// Opções do gráfico
const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Quantidade de Vendas por Produtor no último ano',
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
      font: { weight: 'bold' as const, size: 12 }
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
    const data = await $fetch<Array<{ produtor: string; vendas: number }>>('/api/metrics/sales-frequency')
    
    if (data && Array.isArray(data) && chartData.value.datasets[0]) {
      chartData.value.labels = data.map((item) => item.produtor)
      chartData.value.datasets[0].data = data.map((item) => item.vendas)
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-4 bg-white rounded-2xl shadow w-full h-96">
    <div v-if="loading" class="text-gray-500 text-center">Carregando gráfico...</div>
    <Bar v-else :data="chartData" :options="chartOptions" />
  </div>
</template>