import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'db-search',
      component: require('@/components/DbSearch').default
    },
    {
      path: '/config',
      name: 'test',
      component: require('@/components/Config').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ],
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active'
})
