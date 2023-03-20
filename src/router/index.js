import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/LoginView.vue')
    },
    {
        path: '/playground',
        name: 'playground',
        component: () => import('../views/PlayGroundView.vue')
    },
    {
        path: '/select_mode',
        name: 'select_mode',
        component: () => import('../views/SelectModeView.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
