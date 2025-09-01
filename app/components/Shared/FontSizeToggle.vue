<template>
  <ClientOnly>
    <div class="flex items-center">
      <span class="sr-only">Ajustar tamanho da fonte</span>
      <button
        @click="fontSizeStore.cycleFontSize()"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:text-primary"
        :title="`Tamanho de fonte atual: ${fontSizeDisplay}`"
      >
        <Icon name="lucide:type" class="h-5 w-5" />
        <span class="ml-1">{{ fontSizeShortName }}</span>
      </button>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
  import { useFontSizeStore } from '~/stores/FontSizeStore';

  const fontSizeStore = useFontSizeStore();

  const fontSizeDisplay = computed(() => {
    switch (fontSizeStore.preference) {
      case 'small': return 'Pequeno';
      case 'medium': return 'Médio';
      case 'large': return 'Grande';
      case 'xlarge': return 'Muito Grande';
      default: return 'Médio';
    }
  });

  const fontSizeShortName = computed(() => {
    switch (fontSizeStore.preference) {
      case 'small': return 'P';
      case 'medium': return 'M';
      case 'large': return 'G';
      case 'xlarge': return 'XG';
      default: return 'M';
    }
  });

  onMounted(() => {
    fontSizeStore.initFontSize();
  });
</script>