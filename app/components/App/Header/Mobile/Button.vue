<template>
  <UiButton
    size="icon-sm"
    variant="outline"
    class="menu-button"
    @click="headerStore.mobileNav = true"
  >
    <Icon name="heroicons:bars-2" class="icon" />
  </UiButton>
</template>

<script lang="ts" setup>
  import { useHeaderStore } from "~/stores/HeaderStore";

  const headerStore = useHeaderStore();
</script>

<style scoped>
  .menu-button {
    @apply h-9;
    @apply w-9;
    @apply lg:hidden;
  }

  .icon {
    @apply h-4;
    @apply w-4;
  }
</style>
