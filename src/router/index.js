import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/playground'
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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
