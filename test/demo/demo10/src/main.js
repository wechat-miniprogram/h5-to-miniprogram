import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'
import AAA from './AAA.vue'
import BBB from './BBB.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history', // 是否使用 history api
  routes: [
    { path: '/h5-to-miniprogram/aaa', component: AAA },
    { path: '/h5-to-miniprogram/bbb', component: BBB }
  ]
})

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
