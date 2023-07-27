import App from '../app.vue'
import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { renderToString } from 'vue/server-renderer'

export default defineEventHandler(async event => {
  const data = await $fetch('/bob')
  console.log({ data })
  const template = (await useStorage().getItem('templates:index.html')) as string
  const app = createApp(App)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/:pathMatch(.*)*',
        component: () => import('../pages/index.vue').then(r => r.default),
      },
    ],
  })
  app.use(router)
  await router.push(event.path)
  await router.isReady()
  const html = await renderToString(app)
  return template.replace('<main id="app"></main>', `<main id="app">${html}</main>`)
})
