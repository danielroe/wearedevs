import App from '../app.vue'
import { createSSRApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { $fetch } from 'ofetch'

globalThis.$fetch = $fetch

const app = createSSRApp(App)
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../pages/index.vue').then(r => r.default),
    },
  ],
})
app.use(router)
router.isReady().then(() => app.mount('#app'))
