import { createRouter, createWebHashHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AgentView from '../views/AgentView.vue'
import ConversationsView from '../views/ConversationsView.vue'
import ConversationView from '../views/ConversationView.vue'

import { useListStore } from '../stores/listStore'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [    
    { name: 'home', path: '/', component: HomeView},        
    { name: 'login', path: '/login', component: LoginView},        
    { name: 'agent', path: '/agent', component: AgentView},
    { name: 'conversations', path: '/conversations', component: ConversationsView},
    { name: 'conversation', path: '/conversation/:sid', component: ConversationView}            
  ]
})

router.beforeEach(async (to, from) => {
  
  // make sure Sync Twilio Table List Store is populated
  const listStore = useListStore();
  if (listStore.lists.length === 0 && to.name !== 'home') {    
    return { name: 'home' }
  }  

})

export default router