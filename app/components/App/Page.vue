<template>
  <div>
    <ClientOnly>
      <div class="pageHeader" v-if="computedTitle || computedDescription">
        <h3 v-if="computedTitle" class="pageTitle">
          {{ computedTitle }}
        </h3>
        <p v-if="computedDescription" class="pageDescription">
          {{ computedDescription }}
        </p>
      </div>
    </ClientOnly>
    <slot />
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps<{
    title?: string;
    description?: string;
    hideTop?: boolean;
  }>();

  const useNavigation = useNavigationStore();
  const route = useRoute();

  // Wait for navigation store to be ready
  const { pages } = storeToRefs(useNavigation);

  // Compute values only after navigation is ready
  const computedTitle = computed(() => {
    if (props.title) return props.title;
    return pages.value.find((page) => page.path === route.path)?.title || "";
  });

  const computedDescription = computed(() => {
    if (props.description) return props.description;
    return pages.value.find((page) => page.path === route.path)?.description || "";
  });

  // Ensure navigation data is loaded
  onMounted(() => {
    if (!pages.value.length) {
      useNavigation.fetchPages();
    }
  });
</script>

<style scoped>
  .pageHeader {
    @apply mt-12;
    @apply mb-6;
    @apply border-b;
    @apply pb-5;
  }

  .pageTitle {
    @apply text-2xl font-semibold;
  }

  .pageDescription {
    @apply mt-3 text-muted-foreground;
  }
</style>
