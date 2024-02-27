import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home/inde.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/directory',
      name: 'directory',
      component: () => import('../views/Server-directory/inde.vue')
    }
  ]
})

export default router
