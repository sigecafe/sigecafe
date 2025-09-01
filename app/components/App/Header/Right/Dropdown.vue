<template>
  <div>
    <UiDropdownMenu>
      <UiDropdownMenuTrigger as-child>
        <UiButton data-testid="dropdown-button" class="dropdown-button" variant="outline" size="icon">
          <div class="flex flex-col space-y-1 hidden lg:block">
            <p class="text-sm font-medium leading-none">{{ usuarioStore.usuarioPreferences?.name }}</p>
            <p class="text-xs leading-none text-muted-foreground">
              {{ usuarioStore.usuarioPreferences?.email }}
            </p>
          </div>

          <Icon name="fluent:person-12-regular" class="dropdown-icon" />
        </UiButton>
      </UiDropdownMenuTrigger>
      <UiDropdownMenuContent align="center" :side-offset="15">
        <UiDropdownMenuItem :data-testid="`dropdown-button-${page.title}`" v-for="(page, i) in pages" :key="i"
          class="menu-item" :icon="page.icon ?? ''" :title="page.title ?? ''" @click="navigateTo(page.path)" />

        <UiDropdownMenuItem :data-testid="dropdownLogoutButton" class="menu-item" icon="ph:sign-out-duotone"
          title="Sair" @click="signOut" />
      </UiDropdownMenuContent>
    </UiDropdownMenu>
  </div>
</template>

<script lang="ts" setup>
  const signOut = () => {
    const router = useRouter();
    useAuth()
      .signOut()
      .then(() => {
        router.push("/auth");
      });
  };

  const dropdownLogoutButton = ref("dropdown-button-Sair");

  const usuarioStore = useUsuarioStore();
  const navigationStore = useNavigationStore();
  const pages = computed(() => navigationStore.filterPages("DROPDOWN"));
</script>

<style scoped>
  .dropdown-button {
    @apply h-10 w-auto rounded-full px-4;
  }

  .dropdown-icon {
    @apply h-5 w-5;
  }

  .menu-item {
    @apply cursor-pointer;
  }
</style>
