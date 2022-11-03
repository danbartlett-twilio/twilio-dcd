import { createRouter, createWebHashHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import SettingsView from '../views/SettingsView.vue'
import ListListView from '../views/ListListView.vue'
import ListEditView from '../views/ListEditView.vue'
import ListView from '../views/ListView.vue'
import DocumentListView from '../views/DocumentListView.vue'
import DocumentView from '../views/DocumentView.vue'
import DocumentEditView from '../views/DocumentEditView.vue'


const routes = [
  { path: '/', component: AboutView },
  { path: '/about', component: AboutView },
  { path: '/list-list', name: 'listList', component: ListListView},
  { path: '/list-edit/:id', name:'listEdit', component: ListEditView},
  { path: '/list/:id', name: 'list', component: ListView},
  { path: '/settings', component: SettingsView},
  { path: '/document-list', name: 'documentList', component: DocumentListView},
  { path: '/document/:id', name: 'document', component: DocumentView},
  { path: '/document-edit/:id', name: 'documentEdit', component: DocumentEditView},
];

const router = createRouter({  
  history: createWebHashHistory(),
  routes
})
export default router;