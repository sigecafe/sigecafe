<template>
  <div class="font-size-toggle">
    <SharedFontSizeToggle />
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
  .font-size-toggle {
    @apply flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800;
  }
</style>