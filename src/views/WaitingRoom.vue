<template>
  <ConfirmDialog
    v-if="showConfirm"
    :message="isHost ? 'Вы хост — лобби закроется для всех игроков. Покинуть?' : 'Вы уверены что хотите покинуть лобби?'"
    @confirm="leaveAndGo"
    @cancel="cancelLeave"
  />

  <div class="lobby-wrap">
    <div class="lobby-card">

      <!-- Header -->
      <div class="lobby-header">
        <div class="lobby-title">
          <PixelIcon name="monitor" :size="18" color="var(--c-primary)" />
          <span>{{ lobbyName }}</span>
          <span class="lobby-badge">Ожидание</span>
        </div>
        <button class="close-btn" @click="showConfirm = true" title="Покинуть">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="lobby-body">
        <div class="lobby-columns">

          <!-- Left: players -->
          <div class="lobby-col lobby-col-main">
            <div class="col-head">
              <div class="col-title">
                <PixelIcon name="people" :size="16" color="var(--c-primary)" />
                Игроки
              </div>
              <span class="player-count-badge">{{ players.length }} / {{ settings.maxPlayers }}</span>
            </div>

            <!-- Progress -->
            <div class="players-track">
              <div class="players-fill" :style="{ width: (players.length / settings.maxPlayers * 100) + '%' }" />
            </div>

            <!-- Player list -->
            <div class="player-list">
              <div
                v-for="(p, i) in players"
                :key="p.socketId"
                class="player-row"
                :class="{ 'row-me': p.socketId === mySocketId }"
              >
                <div class="player-avatar" :style="{ background: avatarColor(p.socketId) }">
                  {{ p.nickname?.[0]?.toUpperCase() || '?' }}
                </div>
                <span class="player-num">{{ i + 1 }}.</span>
                <span class="player-nick">{{ p.nickname }}</span>
                <span v-if="p.socketId === hostSocketId" class="tag tag-host">
                  <PixelIcon name="crown" :size="11" color="#d97706" /> Хост
                </span>
                <span v-else-if="p.socketId === mySocketId" class="tag tag-me">Вы</span>
                <button
                  v-if="isHost && p.socketId !== mySocketId"
                  class="kick-btn"
                  @click="kick(p.socketId)"
                  title="Исключить"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div v-if="players.length === 0" class="player-empty">Загрузка...</div>
            </div>
          </div>

          <!-- Right: invite + log -->
          <div class="lobby-col lobby-col-side">

            <!-- Invite -->
            <div class="invite-section">
              <div class="col-title">
                <PixelIcon name="link" :size="16" color="var(--c-primary)" />
                Пригласить
              </div>
              <div class="invite-code-box">
                <span class="invite-code">{{ currentLobbyId }}</span>
              </div>
              <button class="btn btn-secondary invite-btn" @click="copyLink">
                <PixelIcon v-if="copied" name="check" :size="14" color="var(--c-success)" />
                <PixelIcon v-else name="clipboard" :size="14" color="var(--c-primary)" />
                {{ copied ? 'Скопировано!' : 'Копировать ссылку' }}
              </button>
            </div>

            <!-- Log -->
            <div class="log-section">
              <div class="col-title">
                <PixelIcon name="clipboard" :size="16" color="var(--c-primary)" />
                Журнал
              </div>
              <div class="log-box" ref="logEl">
                <div v-for="(entry, i) in logs" :key="i" class="log-line">
                  <span class="log-ts">{{ entry.ts }}</span>
                  <span :class="['log-msg', entry.cls]">{{ entry.msg }}</span>
                </div>
                <div v-if="logs.length === 0" class="log-empty">Пока тихо...</div>
              </div>
            </div>

          </div>
        </div>

        <!-- Bottom actions -->
        <div class="lobby-actions">
          <div v-if="isHost" class="host-action">
            <button
              class="btn btn-primary start-btn"
              :disabled="players.length < 3"
              @click="startGame"
            >
              <PixelIcon name="rocket" :size="16" color="white" />
              {{ players.length < 3 ? `Нужно ещё ${3 - players.length}` : 'Начать игру!' }}
            </button>
            <span v-if="players.length < 3" class="start-hint">Ожидаем ещё игроков...</span>
          </div>
          <div v-else class="waiting-msg">
            <div class="waiting-spinner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" stroke-width="2.5" stroke-linecap="round" style="animation: spin .8s linear infinite">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <span>Ожидаем хоста...</span>
          </div>
          <button class="btn btn-ghost leave-btn" @click="showConfirm = true">
            <PixelIcon name="door" :size="15" color="var(--c-text-muted)" />
            Выйти
          </button>
        </div>

        <p v-if="error" class="error-msg" style="margin-top:6px">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
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
const error          = ref('')
const copied         = ref(false)
const showConfirm    = ref(false)
const pendingRoute   = ref(null)
const leaveConfirmed = ref(false)
const lobbyName    = computed(() => settings.value.name || 'Новая игра')
const isHost       = computed(() => mySocketId.value && mySocketId.value === hostSocketId.value)

const logs = ref([])
const logEl = ref(null)

function ts() {
  const n = new Date()
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
}
function addLog(msg, cls = 'lc-info') {
  logs.value.push({ ts: ts(), msg, cls })
  nextTick(() => { if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight })
}

const AVATAR_COLORS = ['#6366f1','#7c3aed','#0ea5e9','#059669','#d97706','#dc2626','#ec4899']
function avatarColor(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const prevIds = ref([])
watch(players, (next, prev) => {
  const nextIds = next.map(p => p.socketId)
  const prevList = prev || []
  const prevIdSet = prevList.map(p => p.socketId)
  nextIds.forEach(id => {
    if (!prevIdSet.includes(id) && prevIds.value.length > 0) {
      const p = next.find(x => x.socketId === id)
      if (p) addLog(`${p.nickname} подключился`, 'lc-ok')
    }
  })
  prevIdSet.forEach(id => {
    if (!nextIds.includes(id)) {
      const p = prevList.find(x => x.socketId === id)
      if (p) addLog(`${p.nickname} отключился`, 'lc-err')
    }
  })
  prevIds.value = nextIds
}, { deep: true })

function copyLink() {
  navigator.clipboard.writeText(inviteUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
function kick(targetSocketId) {
  socket.emit('kick_player', { lobbyId: currentLobbyId.value, targetSocketId })
  const p = players.value.find(x => x.socketId === targetSocketId)
  if (p) addLog(`${p.nickname} исключён`, 'lc-err')
}
function startGame() {
  socket.emit('start_game', { lobbyId: currentLobbyId.value })
  addLog('Запуск игры...', 'lc-ok')
}
function leaveAndGo() {
  socket.emit('leave_lobby', { lobbyId: currentLobbyId.value })
  showConfirm.value = false
  leaveConfirmed.value = true
  const dest = pendingRoute.value
  pendingRoute.value = null
  router.push(dest || '/')
}
function cancelLeave() {
  showConfirm.value = false
  pendingRoute.value = null
}

onBeforeRouteLeave((to) => {
  if (isHost.value && !leaveConfirmed.value) {
    pendingRoute.value = to
    showConfirm.value = true
    return false
  }
})
function applyLobby(lobby) {
  if (!lobby) return
  players.value     = lobby.players || []
  settings.value    = lobby.settings || settings.value
  hostSocketId.value = lobby.hostSocketId
}

onMounted(async () => {
  mySocketId.value = socket.id
  addLog(`Подключение к комнате...`, 'lc-dim')

  socket.on('lobby_created', ({ lobby, player }) => {
    applyLobby(lobby)
    mySocketId.value = socket.id
    if (player) gameState.myPlayer = player
    addLog(`Комната создана: "${lobbyName.value}"`, 'lc-ok')
  })
  socket.on('lobby_joined', ({ player, lobby }) => {
    applyLobby(lobby)
    mySocketId.value = socket.id
    gameState.myPlayer = player
    addLog(`Вы вошли в "${lobbyName.value}"`, 'lc-ok')
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
    addLog('Игра перезапущена.', 'lc-ok')
  })
  socket.on('player_kicked', ({ socketId }) => {
    if (socketId === socket.id) router.push('/')
  })
  socket.on('lobby_closed', () => router.push('/'))
  socket.on('error', ({ message }) => {
    error.value = message
    addLog(`Ошибка: ${message}`, 'lc-err')
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
        addLog(`Загружено. Игроков: ${lobby.players.length}`, 'lc-ok')
        if (lobby.phase !== 'waiting') router.push(`/game/${currentLobbyId.value}`)
      } else { router.push('/') }
    } catch {}
  }
  if (route.path.startsWith('/join/')) {
    const doJoin = () => socket.emit('join_lobby', { lobbyId: currentLobbyId.value })
    if (socket.connected) { doJoin() } else { socket.once('connect', doJoin) }
  }
})

onUnmounted(() => {
  ['lobby_created','lobby_joined','lobby_updated','game_started',
   'game_restarted','player_kicked','lobby_closed','error'].forEach(e => socket.off(e))
})
</script>

<style scoped>
.lobby-wrap {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 16px; z-index: 5;
}

.lobby-card {
  width: 820px; max-width: 100%;
  background: var(--c-surface);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--c-border);
  animation: fadeScaleIn .25s ease both;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 32px - var(--nav-h));
}

/* Header */
.lobby-header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--c-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--c-surface-2);
  flex-shrink: 0;
}
.lobby-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 16px; font-weight: 700; color: var(--c-text);
}
.lobby-badge {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--c-warning-bg); color: var(--c-warning);
  border: 1px solid #fed7aa; border-radius: var(--r-full);
  padding: 2px 8px; font-size: 11px; font-weight: 600;
}
.close-btn {
  width: 30px; height: 30px; border-radius: var(--r-full);
  border: none; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-text-muted); transition: all .12s;
}
.close-btn:hover { background: var(--c-danger-bg); color: var(--c-danger); }

/* Body */
.lobby-body {
  flex: 1; overflow: hidden;
  padding: 16px 20px;
  display: flex; flex-direction: column; gap: 14px;
}

/* Two-column layout */
.lobby-columns {
  flex: 1;
  display: flex;
  gap: 14px;
  min-height: 0;
  overflow: hidden;
}
.lobby-col { display: flex; flex-direction: column; gap: 10px; min-height: 0; }
.lobby-col-main { flex: 1; overflow: hidden; }
.lobby-col-side { width: 240px; flex-shrink: 0; overflow: hidden; }

/* Column titles */
.col-head {
  display: flex; align-items: center; justify-content: space-between;
}
.col-title {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600;
  color: var(--c-text-muted); text-transform: uppercase; letter-spacing: .04em;
}

/* Player count badge */
.player-count-badge {
  background: var(--c-primary-light); color: var(--c-primary);
  border-radius: var(--r-full); padding: 2px 8px;
  font-size: 12px; font-weight: 700;
}

/* Progress */
.players-track {
  height: 4px; background: var(--c-primary-light); border-radius: var(--r-full); overflow: hidden;
}
.players-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-primary), var(--c-violet));
  border-radius: var(--r-full);
  transition: width .3s;
}

/* Player list */
.player-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  border-radius: var(--r);
}
.player-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--c-border);
  font-size: 14px;
  transition: background .1s;
}
.player-row:last-child { border-bottom: none; }
.player-row:hover { background: var(--c-primary-light); }
.row-me { background: var(--c-primary-light); }
.player-avatar {
  width: 26px; height: 26px;
  border-radius: var(--r-full);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: white;
  flex-shrink: 0;
}
.player-num { font-size: 12px; color: var(--c-text-light); min-width: 18px; }
.player-nick { flex: 1; font-weight: 500; color: var(--c-text); }
.player-empty { padding: 12px; text-align: center; color: var(--c-text-muted); font-size: 13px; font-style: italic; }

.tag {
  display: inline-flex; align-items: center; gap: 3px;
  border-radius: var(--r-full); padding: 1px 7px;
  font-size: 11px; font-weight: 600;
}
.tag-host { background: var(--c-warning-bg); color: var(--c-warning); border: 1px solid #fed7aa; }
.tag-me   { background: var(--c-primary-light); color: var(--c-primary); border: 1px solid var(--c-primary-mid); }

.kick-btn {
  width: 24px; height: 24px; border-radius: var(--r-full);
  border: none; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-text-light); transition: all .12s;
}
.kick-btn:hover { background: var(--c-danger-bg); color: var(--c-danger); }

/* Invite section */
.invite-section { display: flex; flex-direction: column; gap: 8px; }
.invite-code-box {
  background: var(--c-primary-light);
  border: 1px solid var(--c-primary-mid);
  border-radius: var(--r);
  padding: 12px 16px;
  text-align: center;
}
.invite-code {
  font-size: 20px; font-weight: 800;
  color: var(--c-primary); letter-spacing: .12em; font-family: 'Inter', monospace;
}
.invite-btn { width: 100%; font-size: 13px; }

/* Log section */
.log-section { flex: 1; display: flex; flex-direction: column; gap: 8px; min-height: 0; }
.log-box {
  flex: 1; min-height: 80px; max-height: 120px;
  background: var(--c-surface-2); border: 1px solid var(--c-border);
  border-radius: var(--r); padding: 8px 12px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 3px;
}
.log-line { display: flex; gap: 8px; font-size: 12px; line-height: 1.5; }
.log-ts  { color: var(--c-text-light); flex-shrink: 0; font-size: 11px; }
.log-msg { flex: 1; }
.lc-ok   { color: var(--c-success); }
.lc-err  { color: var(--c-danger); }
.lc-dim  { color: var(--c-text-muted); }
.lc-info { color: var(--c-text-2); }
.log-empty { color: var(--c-text-light); font-size: 12px; font-style: italic; text-align: center; padding: 8px 0; }

/* Bottom actions */
.lobby-actions {
  display: flex; gap: 10px; align-items: center;
  padding-top: 4px; flex-shrink: 0;
}
.host-action { flex: 1; display: flex; align-items: center; gap: 12px; }
.start-btn { flex: 1; font-size: 15px; font-weight: 600; padding: 12px 20px; }
.start-hint { font-size: 12px; color: var(--c-text-muted); }
.waiting-msg {
  flex: 1; display: flex; align-items: center; gap: 10px;
  font-size: 14px; color: var(--c-text-muted); padding: 8px 0;
}
.waiting-spinner { flex-shrink: 0; }
.leave-btn { color: var(--c-text-muted); }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 760px) {
  .lobby-wrap { padding: 8px; }
  .lobby-columns { flex-direction: column; overflow-y: auto; }
  .lobby-col-side { width: 100%; }
  .lobby-card { max-height: calc(100vh - 16px - var(--nav-h)); }
}
</style>
