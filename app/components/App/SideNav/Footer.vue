<template>
  <div class="footer">
    <div class="footer-links">
      <NuxtLink to="/app/sobre" class="footer-link">Sobre</NuxtLink>
      <div class="separator">|</div>
      <NuxtLink to="/app/ajuda" class="footer-link">Ajuda</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
  .footer {
    @apply px-4 py-3;
    @apply flex items-center justify-center;
    @apply bg-background;
    @apply mt-auto;
    @apply w-full;
    @apply absolute bottom-0;
  }

  .footer-links {
    @apply flex items-center gap-2;
  }

  .footer-link {
    @apply text-sm text-muted-foreground transition-colors hover:text-foreground;
  }

  .separator {
    @apply text-sm text-muted-foreground;
  }
</style>
