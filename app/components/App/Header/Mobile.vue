<template>
  <AppHeaderMobileButton />
  <UiSheet v-model:open="headerStore.mobileNav">
    <UiSheetContent class="sheet-content">
      <UiSheetTitle title="Mobile menu" class="sr-only" />
      <UiSheetDescription description="A list of navigation items for mobile" class="sr-only" />
      <UiScrollArea class="scroll-area">
        <AppHeaderMobileHeader />
        <AppSideNav />
        <br>
      </UiScrollArea>
    </UiSheetContent>
  </UiSheet>
</template>

<script lang="ts" setup>
  import { useHeaderStore } from "~/stores/HeaderStore";

  const headerStore = useHeaderStore();
</script>

<style scoped>
  .sheet-content {
    @apply p-1;
  }

  .scroll-area {
    @apply h-[calc(100dvh-20px)];
    @apply w-full;
    @apply p-5;
  }
</style>
