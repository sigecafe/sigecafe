<template>
  <div class="container" :key="$route.fullPath">
    <AppHeader />
    <main class="main">
      <div class="side-nav">
        <UiScrollArea class="scroll-area">
          <AppSideNav />
        </UiScrollArea>
      </div>
      <div class="content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>

  const themeToggleStore = useThemeToggleStore();
  themeToggleStore.initTheme();

  const fontSizeStore = useFontSizeStore();
  fontSizeStore.initFontSize();

  const userStore = useUsuarioStore();
  userStore.fetchUsuarioPreferences();

  const navigationStore = useNavigationStore();
  navigationStore.fetchPages();

</script>

<style scoped>
  .main {
    @apply grid;
    @apply grid-cols-1;
    @apply lg:gap-10;
    @apply lg:grid-template-cols-sidenav;
  }

  .lg\:grid-template-cols-sidenav {
    @screen lg {
      grid-template-columns: 250px minmax(0, 1fr);
    }
  }

  .side-nav {
    @apply hidden;
    @apply lg:block;
    @apply sticky;
    @apply top-14;
    @apply z-20;
    @apply h-[calc(100dvh-57px)];
    @apply border-r;
    @apply bg-card;
    @apply text-card-foreground;
  }

  .content {
    @apply min-h-[calc(100dvh-57px)];
  }

  .scroll-area {
    @apply h-[calc(100dvh-57px)];
    @apply px-2;
    @apply py-5;
  }
</style>
