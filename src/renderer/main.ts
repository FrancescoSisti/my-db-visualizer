import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// Import views
import ConnectionView from './views/ConnectionView.vue'
import DatabaseView from './views/DatabaseView.vue'
import QueryEditor from './views/QueryEditor.vue'

// Router configuration
const routes = [
  { 
    path: '/', 
    name: 'connection',
    component: ConnectionView 
  },
  { 
    path: '/database/:name?', 
    name: 'database',
    component: DatabaseView,
    props: true
  },
  { 
    path: '/query', 
    name: 'query',
    component: QueryEditor 
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Create Vue app
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Mount app
app.mount('#app') 