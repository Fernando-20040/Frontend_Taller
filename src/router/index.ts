import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/usuarios' },

    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },

    // Usuarios (lista) — ambos roles autenticados
    { path: '/usuarios', name: 'usuarios', component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true } },

    // Usuarios (crear/editar) — SOLO admin
    { path: '/usuarios/nuevo', name: 'usuarios-nuevo', component: () => import('@/views/UserForm.vue'),
      meta: { requiresAuth: true, requiresAdmin: true } },

    { path: '/usuarios/:id/editar', name: 'usuarios-editar', component: () => import('@/views/UserForm.vue'), props: true,
      meta: { requiresAuth: true, requiresAdmin: true } },

    // Tareas — ambos roles autenticados
    { path: '/tareas', name: 'tareas', component: () => import('@/views/TasksView.vue'),
      meta: { requiresAuth: true } },

    { path: '/:pathMatch(.*)*', redirect: '/usuarios' },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && token) {
    return { name: 'usuarios' }
  }

  if (to.meta.requiresAdmin) {
    const raw = localStorage.getItem('user')
    const user = raw ? JSON.parse(raw) : null
    if (!user || user.rol !== 'admin') {
      return { name: 'usuarios' }
    }
  }

  return true
})

export default router
