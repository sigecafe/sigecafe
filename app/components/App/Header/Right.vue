<template>
  <div class="flex items-center space-x-4">
    <AppHeaderRightThemeToggle />
    <AppHeaderRightFontSizeToggle />
    <AppHeaderRightNotificationIcon />
    <AppHeaderRightDropdown />
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
  .right-section {
    @apply flex items-center;
  }
</style>
