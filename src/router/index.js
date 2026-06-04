import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { public: true } },
    {
      path: '/',
      component: () => import('../components/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/cotacao' },
        { path: 'cotacao', name: 'Cotacao', component: () => import('../views/Cotacao.vue') },
        { path: 'remetentes', name: 'Remetentes', component: () => import('../views/Remetentes.vue') },
        { path: 'destinatarios', name: 'Destinatarios', component: () => import('../views/Destinatarios.vue') },
        { path: 'cotacoes', name: 'Cotacoes', component: () => import('../views/Cotacoes.vue') },
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return next('/login')
  if (to.meta.public && auth.isAuthenticated) return next('/')
  next()
})

export default router
