<template>
  <GameBackground />

  <div class="lc-wrap">
    <div class="xp-window lc-dialog">
      <!-- Titlebar -->
      <div class="xp-titlebar">
        <div class="xp-titlebar-left">
          <span class="xp-title-icon">📄</span>
          <span class="xp-title-text">Создание лобби</span>
        </div>
        <div class="xp-title-btns">
          <button class="xp-ctrl">&#x2014;</button>
          <button class="xp-ctrl">&#x25A1;</button>
          <button class="xp-ctrl xp-ctrl-close" @click="router.push('/')">&#x2715;</button>
        </div>
      </div>

      <div class="xp-body lc-body">

        <!-- Lobby name -->
        <div class="lc-field">
          <label class="lc-label" for="lc-name">📝 Название лобби</label>
          <input
            id="lc-name"
            class="xp-input"
            v-model="lobbyName"
            placeholder="Новая игра"
            maxlength="40"
          />
        </div>

        <div class="xp-sep" />

        <!-- Max players -->
        <div class="lc-field lc-field-row">
          <span class="lc-label">👥 Максимум игроков</span>
          <div class="lc-right">
            <div class="xp-spinner">
              <input class="xp-input" :value="settings.maxPlayers" readonly />
              <div class="xp-spinner-btns">
                <button class="xp-spinner-btn" @click="settings.maxPlayers = Math.min(10, settings.maxPlayers + 1)">▲</button>
                <button class="xp-spinner-btn" @click="settings.maxPlayers = Math.max(2, settings.maxPlayers - 1)">▼</button>
              </div>
            </div>
            <span class="lc-hint">от 2 до 10</span>
          </div>
        </div>

        <!-- Points to win -->
        <div class="lc-field lc-field-row">
          <span class="lc-label">🏆 Очков для победы</span>
          <div class="lc-right">
            <div class="xp-spinner">
              <input class="xp-input" :value="settings.pointsToWin" readonly />
              <div class="xp-spinner-btns">
                <button class="xp-spinner-btn" @click="settings.pointsToWin = Math.min(3, settings.pointsToWin + 1)">▲</button>
                <button class="xp-spinner-btn" @click="settings.pointsToWin = Math.max(1, settings.pointsToWin - 1)">▼</button>
              </div>
            </div>
            <span class="lc-hint">от 1 до 3</span>
          </div>
        </div>

        <div class="xp-sep" />

        <!-- Create button -->
        <button class="xp-btn xp-btn-lg" @click="create" :disabled="loading">
          📄 {{ loading ? 'Создаём...' : 'Создать игру' }}
        </button>

        <p v-if="error" class="error-msg">⚠️ {{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import socket from '../socket.js'
import { gameState } from '../gameState.js'
import GameBackground from '../components/GameBackground.vue'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const lobbyName = ref('Новая игра')

const settings = reactive({ maxPlayers: 10, pointsToWin: 3 })

onMounted(() => {
  socket.once('lobby_created', ({ lobbyId, lobby, player }) => {
    loading.value = false
    gameState.myPlayer = player
    gameState.lobbyId = lobbyId
    router.push(`/lobby/${lobbyId}`)
  })
})

function create() {
  loading.value = true
  error.value = ''
  socket.emit('create_lobby', {
    settings: { ...settings, name: lobbyName.value || 'Новая игра' }
  })
}
</script>

<style scoped>
.lc-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 5;
}

.lc-dialog { width: 600px; max-width: 100%; }

.lc-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 0;
}

.lc-field { display: flex; flex-direction: column; gap: 6px; }
.lc-field-row { flex-direction: row; align-items: center; justify-content: space-between; gap: 12px; }
.lc-label { font-size: 13px; font-family: Tahoma, sans-serif; color: #222; }
.lc-right { display: flex; align-items: center; gap: 8px; }
.lc-hint { font-size: 11px; color: #666; white-space: nowrap; }

@media (max-width: 600px) {
  .lc-wrap { padding: 8px; }
  .lc-field-row { flex-direction: column; align-items: flex-start; }
}
</style>
