<template>
  <div class="left-section">
    <NuxtLink to="/app" class="app-link">
      <AppHeaderLeftLogo />
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
  .logo-section {
    @apply flex;
    @apply items-center;
    @apply ml-5;
    @apply gap-5;
  }

  .app-link {
    @apply flex;
    @apply items-center;
    @apply text-lg;
    @apply font-bold;
  }
</style>
