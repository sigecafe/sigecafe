<template>
  <div class="app-title">
    <div class="logo-container">
      <SharedLogoBeans />
      <SharedLogoSige />
      <SharedLogoCafe />
    </div>
  </div>
</template>

<script lang="ts" setup>
// App title component used throughout the application
</script>

<style scoped>
.app-title {
  font-weight: bold;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
}
</style>
