<template>
  <GameBackground />

  <ConfirmDialog
    v-if="showConfirm"
    message="Вы уверены что хотите покинуть лобби?"
    @confirm="leaveAndGo"
    @cancel="showConfirm = false"
  />

  <div class="wr-wrap">
    <div class="xp-window wr-dialog">
      <!-- Titlebar -->
      <div class="xp-titlebar">
        <div class="xp-titlebar-left">
          <span class="xp-title-icon">👥</span>
          <span class="xp-title-text">Комната ожидания — {{ lobbyName }}</span>
        </div>
        <div class="xp-title-btns">
          <button class="xp-ctrl">&#x2014;</button>
          <button class="xp-ctrl">&#x25A1;</button>
          <button class="xp-ctrl xp-ctrl-close" @click="showConfirm = true">&#x2715;</button>
        </div>
      </div>

      <div class="xp-body wr-body">

        <!-- Player count -->
        <div class="wr-count">
          <span class="wr-count-icon">👥</span>
          <span class="wr-count-num">{{ players.length }} / {{ settings.maxPlayers }}</span>
          <span v-if="isHost" class="wr-host-badge">👑 Вы хост</span>
        </div>

        <!-- Player list -->
        <div class="xp-listbox">
          <div
            v-for="p in players"
            :key="p.socketId"
            class="xp-list-row"
          >
            <img :src="p.avatar" class="wr-avatar" onerror="this.style.display='none'" />
            <span class="wr-nick">{{ p.nickname }}</span>
            <span v-if="p.socketId === hostSocketId" class="wr-crown">👑</span>
            <button
              v-if="isHost && p.socketId !== mySocketId"
              class="xp-btn wr-kick-btn"
              @click="kick(p.socketId)"
            >✕</button>
          </div>
          <div v-if="players.length === 0" class="wr-empty">Загрузка...</div>
        </div>

        <div class="xp-sep" />

        <!-- Invite link -->
        <div class="wr-invite">
          <label class="wr-label">🔗 Ссылка для подключения:</label>
          <div class="wr-invite-row">
            <input class="xp-input" :value="inviteUrl" readonly style="flex:1" />
            <button class="xp-btn" @click="copyLink" style="white-space:nowrap">
              {{ copied ? '✓ Готово' : '📋 Копировать' }}
            </button>
          </div>
          <div class="wr-code-row">
            <span class="wr-label">Код лобби:</span>
            <span class="wr-lobby-code">{{ currentLobbyId }}</span>
          </div>
        </div>

        <div class="xp-sep" />

        <!-- Actions -->
        <button
          v-if="isHost"
          class="xp-btn xp-btn-lg"
          @click="startGame"
          :disabled="players.length < 2"
        >
          🖥️ Начать игру!{{ players.length < 2 ? ' (нужно 2+)' : '' }}
        </button>
        <p v-if="!isHost" class="wr-waiting">⏳ Ждём хоста...</p>

        <button class="xp-btn xp-btn-danger xp-btn-lg" @click="showConfirm = true">
          🚪 Выйти из лобби
        </button>

        <p v-if="error" class="error-msg">⚠️ {{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import socket from '../socket.js'
import { gameState } from '../gameState.js'
import GameBackground from '../components/GameBackground.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()

const currentLobbyId = computed(() => route.params.id)
const inviteUrl = computed(() => `${window.location.origin}/join/${currentLobbyId.value}`)

const players = ref([])
const settings = ref({ maxPlayers: 10, pointsToWin: 3, name: 'Новая игра' })
const hostSocketId = ref(null)
const mySocketId = ref(socket.id || '')
const error = ref('')
const copied = ref(false)
const showConfirm = ref(false)
const lobbyName = computed(() => settings.value.name || 'Новая игра')

const isHost = computed(() => mySocketId.value && mySocketId.value === hostSocketId.value)

function copyLink() {
  navigator.clipboard.writeText(inviteUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
function kick(targetSocketId) {
  socket.emit('kick_player', { lobbyId: currentLobbyId.value, targetSocketId })
}
function startGame() {
  socket.emit('start_game', { lobbyId: currentLobbyId.value })
}
function leaveAndGo() {
  socket.emit('leave_lobby', { lobbyId: currentLobbyId.value })
  router.push('/')
}
function applyLobby(lobby) {
  if (!lobby) return
  players.value = lobby.players || []
  settings.value = lobby.settings || settings.value
  hostSocketId.value = lobby.hostSocketId
}

onMounted(async () => {
  mySocketId.value = socket.id

  socket.on('lobby_created', ({ lobby, player }) => {
    applyLobby(lobby)
    mySocketId.value = socket.id
    if (player) gameState.myPlayer = player
  })
  socket.on('lobby_joined', ({ player, lobby }) => {
    applyLobby(lobby)
    mySocketId.value = socket.id
    gameState.myPlayer = player
  })
  socket.on('lobby_updated', ({ players: p, settings: s, hostSocketId: h }) => {
    players.value = p || []
    settings.value = s || settings.value
    hostSocketId.value = h
  })
  socket.on('game_started', ({ situation, hand, phase }) => {
    gameState.situation = situation
    gameState.hand = hand || []
    gameState.phase = phase
    gameState.lobbyId = currentLobbyId.value
    router.push(`/game/${currentLobbyId.value}`)
  })
  socket.on('game_restarted', ({ players: p, settings: s, hostSocketId: h }) => {
    players.value = p || []
    settings.value = s || settings.value
    hostSocketId.value = h
  })
  socket.on('player_kicked', ({ socketId }) => {
    if (socketId === socket.id) router.push('/')
  })
  socket.on('lobby_closed', () => router.push('/'))
  socket.on('error', ({ message }) => {
    error.value = message
    setTimeout(() => { error.value = '' }, 4000)
  })

  if (route.path.startsWith('/lobby/')) {
    try {
      const base = import.meta.env.VITE_SERVER_URL || ''
      const res = await fetch(`${base}/api/lobby/${currentLobbyId.value}`)
      if (res.ok) {
        const lobby = await res.json()
        applyLobby(lobby)
        mySocketId.value = socket.id
        if (lobby.phase !== 'waiting') router.push(`/game/${currentLobbyId.value}`)
      } else { router.push('/') }
    } catch {}
  }
  if (route.path.startsWith('/join/')) {
    socket.emit('join_lobby', { lobbyId: currentLobbyId.value })
  }
})

onUnmounted(() => {
  socket.off('lobby_created')
  socket.off('lobby_joined')
  socket.off('lobby_updated')
  socket.off('game_started')
  socket.off('game_restarted')
  socket.off('player_kicked')
  socket.off('lobby_closed')
  socket.off('error')
})
</script>

<style scoped>
.wr-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 5;
}

.wr-dialog { width: 600px; max-width: 100%; }

.wr-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
}

.wr-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.wr-count-icon { font-size: 16px; }
.wr-count-num {
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  padding: 2px 8px;
  background: #d4d0c8;
  font-size: 13px;
  font-weight: bold;
}
.wr-host-badge { color: #cc8800; font-size: 12px; }

.wr-avatar { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; }
.wr-nick { flex: 1; font-size: 13px; }
.wr-crown { font-size: 11px; }
.wr-kick-btn {
  padding: 1px 5px;
  min-width: 0;
  font-size: 11px;
  height: 20px;
}
.wr-empty { padding: 8px 10px; color: #666; font-size: 12px; }

.wr-invite { display: flex; flex-direction: column; gap: 6px; }
.wr-label { font-size: 12px; color: #444; }
.wr-invite-row { display: flex; gap: 6px; align-items: center; }
.wr-code-row { display: flex; align-items: center; gap: 8px; }
.wr-lobby-code {
  font-family: 'Courier New', monospace;
  font-size: 15px;
  font-weight: bold;
  color: #1e4bcc;
  letter-spacing: 0.1em;
  background: white;
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-bottom: 2px solid #fff;
  border-right: 2px solid #fff;
  padding: 2px 10px;
}

.wr-waiting { font-size: 12px; color: #666; text-align: center; }

@media (max-width: 600px) {
  .wr-wrap { padding: 8px; }
}
</style>
