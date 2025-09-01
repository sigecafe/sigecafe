<template>
  <nav class="sidenav">
    <div class="content">
      <div class="links-container">
        <AppSideNavLinks />
      </div>
    </div>
    <AppSideNavFooter />
  </nav>
</template>

<style scoped>
  .sidenav {
    @apply flex h-full flex-col;
  }

  .content {
    @apply flex min-h-0 flex-1 flex-col;
  }

  .links-container {
    @apply flex-1 overflow-y-auto;
  }
</style>
