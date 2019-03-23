import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n
import FirebaseServices from './api/FirebasePlugin'

import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

import '@/icons' // icon
import '@/permission' // permission control
import moment from 'moment';

// ---------------------- Create Filters ----------------------

Vue.filter('formatDate', function (value) {
    if (value) {
        return moment(value * 1000).format('MM/DD/YYYY hh:mm')
    }
});

Vue.filter('formatLLLL', function (value) {
    if (value) {
        return moment(value * 1000).format('YYYY D MMM. h:mm A z')
    }
});

Vue.filter('formatOnlyDate', function (value) {
    if (value) {
        return moment(value * 1000).format('hh:mm')
    }
});

Vue.filter('dateChatFormat', function (value) {
    if (value) {
        return moment(value * 1000).format('MMM Do YY')
    }
});

Vue.use(ElementUI, { locale })
Vue.use(FirebaseServices)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
