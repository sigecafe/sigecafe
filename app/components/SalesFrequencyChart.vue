<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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

// Detectar tema
const isDark = ref(false)

// Opções do gráfico
const chartOptions = computed(() => {
  const textColor = isDark.value ? '#e5e7eb' : '#000'
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Quantidade de Vendas por Produtor no último ano',
        padding: { bottom: 30 },
        font: {
          size: 16,
          weight: 'bold' as const
        },
        color: textColor
      },
      datalabels: {
        anchor: 'end' as const,
        align: 'end' as const,
        color: textColor,
        font: { weight: 'bold' as const, size: 12 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          display: true,
          color: textColor,
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        grid: { display: false }, 
        ticks: { display: false },
        beginAtZero: true
      }
    },
    layout: {
      padding: {
        top: 20,
        right: 10,
        bottom: 10,
        left: 10
      }
    },
    barPercentage: 0.9,
    categoryPercentage: 0.95
  }
})

const loading = ref(true)

onMounted(async () => {
  // Detectar tema inicial
  isDark.value = document.documentElement.classList.contains('dark')
  
  // Observer para mudanças de tema
  const observer = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })

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
  <div class="w-full" style="height: 450px;">
    <div v-if="loading" class="text-gray-500 dark:text-gray-400 text-center">Carregando gráfico...</div>
    <Bar v-else :data="chartData" :options="chartOptions" />
  </div>
</template>