import { fileURLToPath } from 'url'

const baseUrl = process.env.BASE_URL
const baseHost = baseUrl?.split(':')[1]
const basePort = baseUrl?.split(':')[2]
const baseAuthUrl = `${baseUrl}/api/auth`
const baseSessionRefresh = parseInt(process.env.SESSION_REFRESH_SECONDS ?? '10') * 1000

export default defineNuxtConfig({
  compatibilityDate: "2024-11-09",
  devtools: { enabled: false },
  future: { compatibilityVersion: 4 },
  experimental: { watcher: "chokidar" },
  devServer: {
    port: parseInt(basePort ?? '80'),
  },
  runtimeConfig: {
    public: {
      BASE_URL: baseUrl,
      BASE_HOST: baseHost,
      BASE_PORT: basePort,
      AUTH_URL: baseAuthUrl,
      SESSION_REFRESH_SECONDS: baseSessionRefresh,
    },
  },
  modules: [
    "@morev/vue-transitions/nuxt",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/test-utils",
    "@nuxtjs/color-mode",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@prisma/nuxt",
    "radix-vue/nuxt",
    "@sidebase/nuxt-auth",
    "@vueuse/nuxt",
  ],


  app: {
    pageTransition: { name: "fade", mode: "out-in" },
    layoutTransition: { name: "fade", mode: "out-in" },
    head: {
      title: "SigeCafé",
      script: [
        {
          src: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/pdfmake.min.js",
          defer: true,
        },
        {
          src: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/vfs_fonts.min.js",
          defer: true,
        },
      ],
    },
  },

  auth: {
    globalAppMiddleware: true,
    originEnvKey: "BASE_URL",
    baseURL: baseAuthUrl,
    provider: {
      type: "authjs",
    },
    sessionRefresh: {
      enablePeriodically: baseSessionRefresh,
    },
  },

  prisma: {
    installCLI: false,
    installClient: false,
    generateClient: false,
    installStudio: false,
    formatSchema: false,
    runMigration: false,
  },

  vite: {
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "./node_modules/.prisma/client/index-browser.js",
      },
    },

    optimizeDeps: {
      include: [
        "vue-use-active-scroll",
        "radix-vue",
        "tailwind-variants",
        "pinia",
        "vue-sonner",
        "datatables.net-plugins/i18n/pt-BR",
      ],
    },
  },

  css: ["~/assets/css/global.css"],

  tailwindcss: {
    exposeConfig: true,
    editorSupport: true,
    viewer: false
  },

  colorMode: {
    classSuffix: "",
  },

  imports: {
    imports: [
      {
        from: "tailwind-variants",
        name: "tv",
      },
      {
        from: "tailwind-variants",
        name: "VariantProps",
        type: true,
      },
      {
        from: "vue-sonner",
        name: "toast",
        as: "useSonner",
      },
    ],
  },

  postcss: {
    plugins: {
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    }
  },
});