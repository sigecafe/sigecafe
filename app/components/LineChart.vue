<script lang="ts" setup>
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
  import { Chart, type ChartData, type ChartOptions } from 'chart.js'

  const props = defineProps<{
    data: ChartData
    options?: ChartOptions
  }>()

  const chartRef = ref<HTMLCanvasElement | null>(null)
  let chart: Chart | null = null

  function initChart() {
    if (!chartRef.value) return

    if (chart) {
      chart.destroy()
    }

    const ctx = chartRef.value.getContext('2d')
    if (!ctx) return

    chart = new Chart(ctx, {
      type: 'line',
      data: props.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...props.options
      }
    })
  }

  onMounted(() => {
    nextTick(() => {
      initChart()
    })
  })

  onBeforeUnmount(() => {
    if (chart) {
      chart.destroy()
    }
  })

  watch(() => props.data, () => {
    nextTick(() => {
      initChart()
    })
  }, { deep: true })
</script>

<template>
  <div class="chart-wrapper">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<style scoped>
  .chart-wrapper {
    position: relative;
    height: 400px;
    width: 100%;
  }
</style>