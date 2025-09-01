import phoneMaskPlugin from '~/utils/phoneUtils';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(phoneMaskPlugin);
});