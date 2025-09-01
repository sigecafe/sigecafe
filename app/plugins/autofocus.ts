export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("autofocus", {
    mounted(el) {
      setTimeout(() => {
        el.focus();
      }, 100);
    },
    updated(el) {
      setTimeout(() => {
        el.focus();
      }, 100);
    },
  });
});
