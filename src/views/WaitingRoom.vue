<template>
  <ConfirmDialog
    v-if="showConfirm"
    message="Вы уверены что хотите покинуть лобби?"
    @confirm="leaveAndGo"
    @cancel="showConfirm = false"
  />

  <div class="lobby-wrap">
    <div class="win-window lobby-window">

      <!-- Titlebar -->
      <div class="win-titlebar">
        <div class="win-titlebar-left">
          <span class="win-title-icon"><PixelIcon name="monitor" :size="14" /></span>
          <span class="win-title-text">{{ lobbyName }} — Ожидание игроков</span>
        </div>
        <div class="win-title-btns">
          <button class="win-ctrl">─</button>
          <button class="win-ctrl">□</button>
          <button class="win-ctrl win-ctrl-close" @click="showConfirm = true">✕</button>
        </div>
      </div>

      <div class="lobby-body">

        <!-- Top row: players + invite -->
        <div class="lobby-top">

          <!-- Player list -->
          <div class="lobby-section" style="flex:1">
            <div class="section-header">
              <span class="section-title"><PixelIcon name="people" :size="14" /> Игроки</span>
              <span class="player-count">{{ players.length }} / {{ settings.maxPlayers }}</span>
            </div>
            <div class="player-progress">
              <div class="player-fill" :style="{ width: (players.length / settings.maxPlayers * 100) + '%' }" />
            </div>
            <div class="xp-listbox player-list">
              <div
                v-for="(p, i) in players"
                :key="p.socketId"
                class="player-row"
                :class="{ 'player-me': p.socketId === mySocketId }"
              >
                <span class="player-num">{{ i + 1 }}.</span>
                <span class="player-nick">{{ p.nickname }}</span>
                <span v-if="p.socketId === hostSocketId" class="badge-host"><PixelIcon name="crown" :size="12" /> Хост</span>
                <span v-else-if="p.socketId === mySocketId" class="badge-me">Вы</span>
                <button
                  v-if="isHost && p.socketId !== mySocketId"
                  class="kick-btn"
                  @click="kick(p.socketId)"
                  title="Кикнуть"
                >✕</button>
              </div>
              <div v-if="players.length === 0" class="player-empty">Загрузка...</div>
            </div>
          </div>

          <!-- Right panel: invite + log -->
          <div class="lobby-section lobby-right">
            <!-- Invite -->
            <div class="section-header">
              <span class="section-title"><PixelIcon name="link" :size="14" /> Пригласить</span>
            </div>
            <div class="invite-code-box">
              <span class="invite-code">{{ currentLobbyId }}</span>
            </div>
            <button class="xp-btn invite-copy-btn" @click="copyLink">
              <PixelIcon v-if="copied" name="check" :size="12" />
              <PixelIcon v-else name="clipboard" :size="12" />
              {{ copied ? 'Скопировано!' : 'Копировать ссылку' }}
            </button>

            <!-- Log -->
            <div class="section-header" style="margin-top:14px">
              <span class="section-title"><PixelIcon name="clipboard" :size="14" /> Журнал</span>
            </div>
            <div class="log-box" ref="logEl">
              <div v-for="(entry, i) in logs" :key="i" class="log-line">
                <span class="log-ts">{{ entry.ts }}</span>
                <span :class="['log-msg', entry.cls]">{{ entry.msg }}</span>
              </div>
            </div>
          </div>

        </div>

        <hr class="win-sep" />

        <!-- Actions -->
        <div class="lobby-actions">
          <div v-if="isHost">
            <button
              class="xp-btn start-btn"
              @click="startGame"
              :disabled="players.length < 2"
            >
              <PixelIcon name="rocket" :size="16" /> {{ players.length < 2 ? 'Начать игру (нужно 2+ игрока)' : 'Начать игру!' }}
            </button>
          </div>
          <div v-else class="waiting-msg">
            <PixelIcon name="hourglass" :size="16" /> Ожидаем хоста...
          </div>
          <button class="xp-btn leave-btn" @click="showConfirm = true">
            <PixelIcon name="door" :size="14" /> Выйти
          </button>
        </div>

        <p v-if="error" class="error-msg" style="margin-top:6px">{{ error }}</p>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import socket from '../socket.js'
import { gameState } from '../gameState.js'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import PixelIcon from '../components/PixelIcon.vue'

const route  = useRoute()
const router = useRouter()

const currentLobbyId = computed(() => route.params.id)
const inviteUrl = computed(() => `${window.location.origin}/join/${currentLobbyId.value}`)

const players     = ref([])
const settings    = ref({ maxPlayers: 10, pointsToWin: 3, name: 'Новая игра' })
const hostSocketId = ref(null)
const mySocketId   = ref(socket.id || '')
const error        = ref('')
const copied       = ref(false)
const showConfirm  = ref(false)
const lobbyName    = computed(() => settings.value.name || 'Новая игра')
const isHost       = computed(() => mySocketId.value && mySocketId.value === hostSocketId.value)

// ── Log ──────────────────────────────────────────────────────
const logs = ref([])
const logEl = ref(null)

function ts() {
  const n = new Date()
  const h = String(n.getHours()).padStart(2, '0')
  const m = String(n.getMinutes()).padStart(2, '0')
  const s = String(n.getSeconds()).padStart(2, '0')
  return `[${h}:${m}:${s}]`
}
function addLog(msg, cls = 'tc-white') {
  logs.value.push({ ts: ts(), msg, cls })
  nextTick(() => {
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
  })
}

// Detect player join/leave
const prevIds = ref([])
watch(players, (next, prev) => {
  const nextIds = next.map(p => p.socketId)
  const prevList = prev || []
  const prevIdSet = prevList.map(p => p.socketId)

  nextIds.forEach(id => {
    if (!prevIdSet.includes(id) && prevIds.value.length > 0) {
      const p = next.find(x => x.socketId === id)
      if (p) addLog(`${p.nickname} подключился`, 'tc-ok')
    }
  })
  prevIdSet.forEach(id => {
    if (!nextIds.includes(id)) {
      const p = prevList.find(x => x.socketId === id)
      if (p) addLog(`${p.nickname} отключился`, 'tc-err')
    }
  })
  prevIds.value = nextIds
}, { deep: true })

// ── Game logic (unchanged) ────────────────────────────────────
function copyLink() {
  navigator.clipboard.writeText(inviteUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
function kick(targetSocketId) {
  socket.emit('kick_player', { lobbyId: currentLobbyId.value, targetSocketId })
  const p = players.value.find(x => x.socketId === targetSocketId)
  if (p) addLog(`${p.nickname} был кикнут`, 'tc-err')
}
function startGame() {
  socket.emit('start_game', { lobbyId: currentLobbyId.value })
  addLog('Запуск игры...', 'tc-ok')
}
function leaveAndGo() {
  socket.emit('leave_lobby', { lobbyId: currentLobbyId.value })
  router.push('/')
}
function applyLobby(lobby) {
  if (!lobby) return
  players.value   = lobby.players || []
  settings.value  = lobby.settings || settings.value
  hostSocketId.value = lobby.hostSocketId
}

onMounted(async () => {
  mySocketId.value = socket.id
  addLog(`Подключение к комнате ${currentLobbyId.value}...`, 'tc-dim')

  socket.on('lobby_created', ({ lobby, player }) => {
    applyLobby(lobby)
    mySocketId.value = socket.id
    if (player) gameState.myPlayer = player
    addLog(`Комната создана: "${lobbyName.value}"`, 'tc-ok')
  })
  socket.on('lobby_joined', ({ player, lobby }) => {
    applyLobby(lobby)
    mySocketId.value = socket.id
    gameState.myPlayer = player
    addLog(`Вы вошли в комнату "${lobbyName.value}"`, 'tc-ok')
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
    addLog('Игра перезапущена. Ожидание...', 'tc-ok')
  })
  socket.on('player_kicked', ({ socketId }) => {
    if (socketId === socket.id) router.push('/')
  })
  socket.on('lobby_closed', () => router.push('/'))
  socket.on('error', ({ message }) => {
    error.value = message
    addLog(`Ошибка: ${message}`, 'tc-err')
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
        prevIds.value = lobby.players.map(p => p.socketId)
        addLog(`Комната загружена. Игроков: ${lobby.players.length}`, 'tc-ok')
        if (lobby.phase !== 'waiting') router.push(`/game/${currentLobbyId.value}`)
      } else { router.push('/') }
    } catch {}
  }
  if (route.path.startsWith('/join/')) {
    const doJoin = () => socket.emit('join_lobby', { lobbyId: currentLobbyId.value })
    if (socket.connected) {
      doJoin()
    } else {
      socket.once('connect', doJoin)
    }
  }
})

onUnmounted(() => {
  ['lobby_created','lobby_joined','lobby_updated','game_started',
   'game_restarted','player_kicked','lobby_closed','error']
    .forEach(e => socket.off(e))
})
</script>

<style scoped>
.lobby-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 5;
}

.lobby-window {
  width: 860px;
  max-width: 100%;
}

.lobby-body {
  background: #d4d0c8;
  padding: 20px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Top two-column layout */
.lobby-top {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.lobby-right {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Section header */
.lobby-section { display: flex; flex-direction: column; gap: 6px; }
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.section-title {
  font-family: Tahoma, sans-serif;
  font-size: 15px;
  font-weight: bold;
  color: #222;
}
.player-count {
  font-family: Tahoma, sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: #003399;
}

/* Progress bar */
.player-progress {
  height: 10px;
  background: white;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  overflow: hidden;
}
.player-fill {
  height: 100%;
  background: repeating-linear-gradient(90deg, #0a4ee8 0px, #0a4ee8 8px, #1a6aff 8px, #1a6aff 10px);
  transition: width 0.3s;
}

/* Player list */
.player-list { max-height: 220px; overflow-y: auto; }
.player-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-bottom: 1px solid #e8e4dc;
  font-family: Tahoma, sans-serif;
  font-size: 14px;
}
.player-row:hover { background: #dce8ff; }
.player-me { background: #eef4ff; }
.player-num { color: #888; min-width: 20px; font-size: 13px; }
.player-nick { flex: 1; color: #222; font-weight: 500; }
.player-empty { padding: 10px; color: #888; font-style: italic; font-size: 13px; }

.badge-host {
  font-size: 12px;
  color: #8b6000;
  background: #fff3cd;
  border: 1px solid #f4a800;
  padding: 1px 6px;
  border-radius: 2px;
}
.badge-me {
  font-size: 12px;
  color: #004499;
  background: #dce8ff;
  border: 1px solid #7aabff;
  padding: 1px 6px;
  border-radius: 2px;
}

.kick-btn {
  background: #e87070;
  border: none;
  color: white;
  font-size: 11px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kick-btn:hover { background: #c84040; }

/* Invite */
.invite-code-box {
  background: white;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  padding: 10px 14px;
  text-align: center;
}
.invite-code {
  font-family: 'Courier New', monospace;
  font-size: 22px;
  font-weight: bold;
  color: #003399;
  letter-spacing: 0.2em;
}
.invite-copy-btn {
  width: 100%;
  font-size: 13px;
  padding: 6px;
}

/* Log */
.log-box {
  background: white;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  padding: 6px 10px;
  max-height: 110px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.log-line {
  display: flex;
  gap: 6px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.5;
}
.log-ts  { color: #aaa; flex-shrink: 0; }
.log-msg { flex: 1; }
.tc-ok   { color: #008000; }
.tc-err  { color: #cc0000; }
.tc-dim  { color: #888; }

/* Actions */
.lobby-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.start-btn {
  font-size: 17px;
  font-weight: bold;
  padding: 12px 28px;
  color: #003399;
  flex: 1;
}
.start-btn:not(:disabled):hover { background: #e8f0ff; }
.leave-btn {
  font-size: 15px;
  padding: 10px 20px;
  color: #666;
}
.leave-btn:hover { color: #cc0000; background: #fff0f0; }

.waiting-msg {
  flex: 1;
  font-family: Tahoma, sans-serif;
  font-size: 16px;
  color: #555;
  padding: 10px 0;
}

@media (max-width: 880px) {
  .lobby-wrap { padding: 8px; }
  .lobby-top  { flex-direction: column; }
  .lobby-right { width: 100%; }
}
</style>
