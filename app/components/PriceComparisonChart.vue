<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

interface PriceData {
  mes: string
  precoMedioProdutor: number
  precoArabica: number
  precoRobusta: number
}

const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Preço Médio Produtor',
      borderColor: '#008000',
      backgroundColor: '#008000',
      tension: 0.3,
      fill: false,
      data: [] as number[]
    },
    {
      label: 'Preço CEPEA Arabica',
      borderColor: '#c59607ff',
      backgroundColor: '#c59607ff',
      tension: 0.3,
      fill: false,
      data: [] as number[]
    },
    {
      label: 'Preço CEPEA Robusta',
      borderColor: '#607060',
      backgroundColor: '#607060',
      tension: 0.3,
      fill: false,
      data: [] as number[]
    }
  ]
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: {
      display: true,
      text: 'Comparativo de Preços: Produtor vs CEPEA (Últimos 12 Meses)'
    }
  },
  scales: {
    y: { title: { display: true, text: 'R$/saca' } },
    x: { title: { display: true, text: 'Mês/Ano' } }
  }
})

onMounted(async () => {
  try {
    const response = await $fetch('/api/metrics/price-comparison')

    chartData.value = {
      labels: response.map((d: any) => d.mes),
      datasets: [
        {
          label: 'Preço Médio Produtor',
          borderColor: '#008000',
          backgroundColor: '#008000',
          tension: 0.3,
          fill: false,
          data: response.map((d: any) => d.precoMedioProdutor)
        },
        {
          label: 'Preço CEPEA Arabica',
          borderColor: '#c59607ff',
          backgroundColor: '#c59607ff',
          tension: 0.3,
          fill: false,
          data: response.map((d: any) => d.precoArabica)
        },
        {
          label: 'Preço CEPEA Robusta',
          borderColor: '#607060',
          backgroundColor: '#607060',
          tension: 0.3,
          fill: false,
          data: response.map((d: any) => d.precoRobusta)
        }
      ]
    }
  } catch (err) {
    console.error('Erro ao buscar dados:', err)
  }
})
</script>

<template>
  <div class="w-full h-[400px]">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>