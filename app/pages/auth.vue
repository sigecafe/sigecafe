<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
  definePageMeta({
    layout: "auth",
    auth: {
      unauthenticatedOnly: true,
      navigateAuthenticatedTo: "/app",
    },
  });
</script>
