<template>
  <div class="sticky-header">
    <div class="logo-container">
      <UiSheetClose class="close-button">
        <Icon name="lucide:x" />
      </UiSheetClose>
      <SharedLogo class="mobile-logo text-sm" />
    </div>
    <div class="header-content">
      <SharedAppTitle />
    </div>
    <UiSeparator class="separator" />
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
  .sticky-header {
    @apply sticky;
    @apply top-0;
    @apply mb-3;
    @apply w-full;
    @apply bg-background;
    @apply z-50;
  }

  .logo-container {
    @apply flex;
    @apply justify-center;
  }

  .mobile-logo {
    @apply block;
    @apply md:hidden;
  }

  .header-content {
    @apply flex;
    @apply items-center;
    @apply gap-3;
    @apply text-lg;
    @apply font-bold;
  }

  .close-button {
    @apply mr-4;
    @apply font-bold;

  }

  .separator {
    @apply mt-4;
  }
</style>
