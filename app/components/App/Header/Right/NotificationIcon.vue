<template>
  <NuxtLink to="/app/notificacoes" class="notification-icon">
    <Icon name="lucide:bell" class="icon" />
    <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
  </NuxtLink>
</template>

<script lang="ts" setup>
const unreadCount = ref(5); // This should be fetched from an API or store

// Example of how to fetch unread notification count
onMounted(async () => {
  try {
    // This would be replaced with an actual API call
    // const response = await $fetch('/api/notificacao/unread-count');
    // unreadCount.value = response.count;
  } catch (error) {
    console.error('Error fetching notification count:', error);
  }
});
</script>

<style scoped>
.notification-icon {
  @apply relative flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800;
}

.icon {
  @apply h-5 w-5;
}

.unread-badge {
  @apply absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white;
}
</style>