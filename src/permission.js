import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 
import 'nprogress/nprogress.css'// Progress 
import { Message } from 'element-ui'
import Vue from 'vue'
import Layout from './views/layout/Layout'

const whiteList = ['/login']

var loadDinamicTables = function (next) {

    // Add Dinamic Tables to Left Menu
    store.dispatch('GetTables').then(res => {
        for (let index = 0; index < res.tables.length; index++) {
            const element = res.tables[index];

            router.options.routes.push(
                {
                    path: '/content/' + element.name,
                    component: Layout,
                    redirect: '/content',
                    children: [
                        {
                            path: 'index',
                            name: element.name,
                            component: () => import('@/views/firebase-table/dinamic-content.vue'),
                            meta: { title: element.title || element.name, icon: element.icon || 'user' }
                        }
                    ]
                });
        }

        next()
    })
}

router.beforeEach((to, from, next) => {
    NProgress.start()

    if (Vue.api.getToken()) {
        if (to.path === '/login') {
            next({ path: '/' })
            NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
        } else {
            // If user is login but user's profile isn't loaded
            console.log("GET INFO ??", store.getters.roles.length)
            if (store.getters.roles.length === 0) {
                store.dispatch('GetInfo').then(res => {
                    loadDinamicTables(next);
                }).catch((err) => {
                    store.dispatch('FedLogOut').then(() => {
                        Message.error(err || 'Verification failed, please login again')
                        next({ path: '/' })
                    })
                })
            } else {
                next()
            }
        }
    } else {
        if (whiteList.indexOf(to.path) !== -1) {
            next()
        } else {
            next(`/login?redirect=${to.path}`)
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    NProgress.done()
})
