const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/channels/general' },
      {
        path: 'channels/:name',
        component: () => import('@/pages/ChatPage.vue')
      }
    ]
  },
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: 'login', component: () => import('@/pages/LoginPage.vue') },
      { path: 'register', component: () => import('@/pages/RegisterPage.vue') }
    ]
  }
]

export default routes