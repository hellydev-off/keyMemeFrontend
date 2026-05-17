import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import LobbyCreate from './views/LobbyCreate.vue'
import WaitingRoom from './views/WaitingRoom.vue'
import GameView from './views/GameView.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/create', component: LobbyCreate },
    { path: '/lobby/:id', component: WaitingRoom },
    { path: '/join/:id', component: WaitingRoom },
    { path: '/game/:id', component: GameView }
  ]
})

createApp(App).use(router).mount('#app')
