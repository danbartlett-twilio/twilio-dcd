import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ConversationView from '../views/ConversationView.vue'

const router = createRouter({
  history: createWebHashHistory(),  
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    { name: 'conversation', path: '/conversation/:sid', component: ConversationView}                
  ]
})

export default router
