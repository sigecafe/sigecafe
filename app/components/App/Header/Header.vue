<template>
  <header>
    <div class="main-container">
      <AppHeaderMobile />
      <AppHeaderLeft />
      <AppHeaderRight />
    </div>
  </header>
</template>

<script lang="ts" setup></script>

<style scoped>
  header {
    @apply sticky;
    @apply top-0;
    @apply z-30;
    @apply border-b;
    @apply bg-background/50;
    @apply backdrop-blur;
  }

  .main-container {
    @apply container;
    @apply flex;
    @apply h-14;
    @apply items-center;
    @apply justify-between;
  }

  .left-section {
    @apply flex;
    @apply items-center;
    @apply gap-10;
  }
</style>
