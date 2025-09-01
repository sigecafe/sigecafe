<template>
  <div>
    <AppPage>
      <SharedMsgDanger title="Excluir Conta"
        description="Você tem certeza que deseja excluir sua conta? Essa ação é irreversível e todos os seus dados serão perdidos." />

      <UiButton data-testid="delete-account-button" variant="destructive" @click="isOpen = true">
        Excluir Conta
      </UiButton>

      <AlertDialogRoot v-model:open="isOpen">
        <AlertDialogPortal>
          <AlertDialogOverlay
            class="data-[state=open]:animate-overlayShow fixed inset-0 z-30 bg-background/80 backdrop-blur-sm">
            <div
              class="absolute h-full w-full bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)] [background-size:15px_15px] [mask-image:radial-gradient(ellipse_600px_600px_at_50%_50%,#000_10%,transparent_100%)] dark:bg-[radial-gradient(theme(colors.border)_1px,transparent_1px)]" />
          </AlertDialogOverlay>
          <AlertDialogContent
            class="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-[100] max-h-[85vh] w-[90vw] max-w-[700px] translate-x-[-50%] translate-y-[-50%] rounded-lg border border-input bg-primary-foreground p-[25px] text-[15px] shadow-[0_0px_50px_-30px_rgba(0,0,0,0.5)] focus:outline-none dark:bg-black dark:shadow-[0_0px_80px_-50px_rgba(0,0,0,0.5)] dark:shadow-gray-500 sm:w-[700px]">
            <AlertDialogTitle class="mb-4 text-xl font-semibold">
              Excluir Conta
            </AlertDialogTitle>
            <AlertDialogDescription class="text-mauve11 mb-5 mt-4 text-[15px] leading-normal">
              Essa ação não pode ser desfeita. Isso irá permanentemente excluir sua conta
              e remover seus dados dos nossos servidores.
            </AlertDialogDescription>
            <div class="flex justify-end gap-[25px]">
              <AlertDialogCancel
                class="text-mauve11 bg-mauve4 hover:bg-mauve5 focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                class="text-red11 bg-red4 hover:bg-red5 focus:shadow-red7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-semibold leading-none outline-none focus:shadow-[0_0_0_2px]"
                @click="handleDelete">
                <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                {{ loading ? 'Excluindo...' : 'Sim, excluir conta' }}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialogRoot>
    </AppPage>
  </div>
</template>

<script setup lang="ts">
  import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogRoot,
    AlertDialogTitle,
  } from "radix-vue";

  const usuarioStore = useUsuarioStore()
  const loading = ref(false)
  const isOpen = ref(false)

  async function handleDelete() {
    try {
      loading.value = true
      await usuarioStore.deleteUsuario()

      const router = useRouter();
      useAuth()
        .signOut()
        .then(() => {
          router.push("/auth");
        });

      navigateTo('/auth')
    } catch (error) {
      console.error('Erro ao excluir conta:', error)
    } finally {
      loading.value = false
      isOpen.value = false
    }
  }
</script>