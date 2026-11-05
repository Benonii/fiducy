export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  css: ['@fiducy/example-kit/styles.css'],
  app: { head: { title: 'Fiducy with Nuxt' } },
  build: { transpile: ['@fiducy/example-kit'] },
  devtools: { enabled: false }
});
