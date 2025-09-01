<template>
  <div class="container" :key="$route.fullPath">
    <UiCard class="card">
      <div class="topbar"></div>
      <div class="theme-toggle">
        <SharedThemeToggle />
      </div>
      <slot />
    </UiCard>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
  .container {
    @apply flex h-dvh items-center justify-center;
    background-image: radial-gradient(theme(colors.border) 1px, transparent 1px);
    background-size: 15px 15px;
    mask-image: radial-gradient(ellipse 600px 600px at 50% 50%, #000 50%, transparent 100%);
  }

  .dark .container {
    background-image: radial-gradient(theme(colors.border) 1px, transparent 1px);
  }

  .card {
    @apply relative m-4 grid min-h-[550px] w-full;
    @apply grid-cols-1 place-content-center rounded-lg border p-4;
    @apply sm:w-[508px];
    box-shadow: 0 0px 80px -30px rgba(0, 0, 0, 0.3);
  }

  .dark .card {
    @apply bg-[#111111];
  }

  .topbar {
    @apply absolute inset-x-0 top-0;
    @apply flex items-center justify-center;
    @apply rounded-t-lg bg-[#09090b] p-1 shadow-xl;
  }

  .dark .topbar {
    @apply bg-[#e2e2e2];
  }

  .theme-toggle {
    @apply absolute left-8 top-8;
  }

  .icon {
    @apply h-4 w-4;
  }
</style>
