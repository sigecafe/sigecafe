<template>
  <div>
    <div class="warning-container">
      <div class="warning-header">
        <Icon name="lucide:alert-triangle" class="warning-icon" />
        <h4 class="warning-title">{{ title }}</h4>
      </div>
      <p class="warning-description">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
  defineProps<{
    title: string;
    description: string;
  }>();
</script>

<style scoped>
  .warning-container {
    @apply my-8 rounded-lg border border-red-500 bg-red-50 p-4 text-red-800 dark:bg-red-900/10 dark:text-red-500;
  }

  .warning-header {
    @apply flex items-center gap-3;
  }

  .warning-icon {
    @apply h-5 w-5;
  }

  .warning-title {
    @apply font-medium;
  }

  .warning-description {
    @apply mt-2 text-sm;
  }
</style>
