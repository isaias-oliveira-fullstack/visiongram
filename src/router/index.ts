import {
  createRouter,
  createWebHistory
} from 'vue-router'
import {
  useModalManagerStore,
  usePhotoStore,
  useAuthStore
} from '@/stores'
import {
  ModalName
} from '@/common'
import NProgress from 'nprogress'

const ROOT_ROUTE = '/home'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'public',
      component: () => import('@/layouts/LayoutMain.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '/',
          alias: '/home',
          name: 'home',
          component: () => import('@/views/Home.vue'),
          meta: {}
        },
        {
          path: '/explore',
          name: 'explore',
          component: () => import('@/views/Explore.vue'),
          meta: {}
        },
        {
          path: '/stories',
          name: 'stories',
          component: () => import('@/views/Story.vue'),
          meta: {}
        },
        {
          path: '/direct',
          name: 'direct',
          component: () => import('@/views/Direct.vue'),
          meta: {}
        },
        {
          path: '/reels',
          name: 'reels',
          component: () => import('@/views/Reels.vue'),
          meta: {}
        },
        {
          path: '/search',
          name: 'search',
          component: () => import('@/views/Search.vue'),
          meta: {}
        },
        {
          path: '/notifications',
          name: 'notifications',
          component: () => import('@/views/Notification.vue'),
          meta: {}
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('@/views/Setting.vue'),
          meta: {}
        },
        {
          path: '/create',
          name: 'create',
          children: [
            {
              path: 'style',
              name: 'style',
              component: () => import('@/components/core/modals/PhotoModal.vue'),
              meta: { title: 'Create Image' }
            },
            {
              path: 'story',
              name: 'story',
              component: () => import('@/views/errors/NotFound.vue'),
              meta: { title: 'Create Story' }
            },
          ],
        },
        {
          path: '/profile/:username?',
          name: 'profile',
          component: () => import('@/views/Profile.vue'),
          meta: {}
        },
        {
          path: '/:pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('@/views/errors/NotFound.vue')
        },
      ]
    },
    {
      path: '/p/:id?',
      name: 'post',
      component: () => import('@/layouts/LayoutPost.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: () => import('@/layouts/LayoutAuth.vue'),
      children: [
        {
          alias: '/accounts',
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/Login.vue'),
          meta: { title: 'Login' }
        },
        {
          path: 'signup',
          name: 'signup',
          component: () => import('@/views/auth/Signup.vue'),
          meta: { title: 'Sign up' }
        },
        {
          path: 'forgot',
          name: 'forgot-password',
          component: () => import('@/views/auth/ForgotPassword.vue'),
          meta: { title: 'Forgot Password' }
        },
        {
          path: 'reset',
          name: 'reset',
          component: () => import('@/views/auth/ResetPassword.vue'),
          meta: { title: 'Reset Password' }
        },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'Not Found',
      component: () => import("@/views/errors/NotFound.vue"),
      meta: { title: 'Not Found' }
    }


  ]
})


/**
 * RouterGuard
 */
router.beforeEach(async (to, from, next) => {
  const photoStore = usePhotoStore()
  const modalStoreManager = useModalManagerStore()
  const authStore = useAuthStore()

  // Se não for o carregamento inicial da página.
  if (to.name) {
      // Inicia a barra de progresso da rota.
      NProgress.start()
  }

  if (to.matched.some(record => record.meta.requiresAuth) && !authStore.token) {
    return next({ name: 'login' })
  }

  // O usuário não deve conseguir acessar a rota de criação sem uma imagem de pré-visualização
  if (to.path.startsWith('/create') && !photoStore.previewImage) {
    return next({ name: 'home' })
  }

  // Reseta o estado de qualquer modal ao navegar para uma sobreposição de post.
  // Isso evita deixar um modal de foto antigo aberto sob o modal de publicação.
  if (to.name === 'post') {
    if (photoStore.isToggled || photoStore.previewImage || photoStore.isFileUploadDialogOpen) {
      photoStore.$reset()
    }

    if (modalStoreManager.getOpenModal && modalStoreManager.getOpenModal !== ModalName.POST) {
      modalStoreManager.closeModal()
      modalStoreManager.clearActivePost()
    }
  }

  return next()
})

router.afterEach((to, from, failure) => {
  if (to.meta.title && failure?.from.path !== ROOT_ROUTE) {
    // Only update page title if no failure
    document.title = `VisionGram - ${ to.meta.title }`
  }

  // Complete the animation of the route progress bar.
  NProgress.done()
})
export default router
