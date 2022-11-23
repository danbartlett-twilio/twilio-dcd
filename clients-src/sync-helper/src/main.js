import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";


const app = createApp(App);

app.use(createPinia()).use(router).use(Toast, {timeout: 2000});

app.mount('#app')
