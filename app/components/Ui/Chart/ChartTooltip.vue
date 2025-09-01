<template>
  <UiCard class="text-sm">
    <UiCardContent class="flex min-w-[180px] flex-col gap-2 p-3">
      <div v-if="title" class="text-center font-medium mb-1">{{ formatDate(title) }}</div>
      <div v-for="(item, key) in data" :key="key" class="flex items-center justify-between py-1">
        <div class="flex items-center">
          <span class="mr-2 h-6 w-1.5 rounded-sm" :style="{ background: item.color }" />
          <span class="text-gray-600">{{ item.name }}</span>
        </div>
        <span class="ml-4 font-semibold">{{ formatValue(item.value) }}</span>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  data: {
    name: string;
    color: string;
    value: any;
  }[];
}>();

function formatValue(value: any): string {
  if (typeof value === 'number') {
    return `R$ ${value.toFixed(2)}`;
  }
  return String(value);
}

function formatDate(timestamp: string): string {
  try {
    // For ApexCharts, the timestamp is usually a string
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return timestamp;
  }
}
</script>