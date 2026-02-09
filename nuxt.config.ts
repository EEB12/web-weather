import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/ui',
      '@vueuse/nuxt',
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  
})
