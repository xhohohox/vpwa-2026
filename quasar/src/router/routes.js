const routes = [
  {
    path: '/',
    component: () => import('@/pages/IndexPage.vue')
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