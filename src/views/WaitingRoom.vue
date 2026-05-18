<template>
  <GameBackground />

  <ConfirmDialog
    v-if="showConfirm"
    message="Вы уверены что хотите покинуть лобби?"
    @confirm="leaveAndGo"
    @cancel="showConfirm = false"
  />

  <div class="term-wrap">
    <div class="term-box">

      <!-- Titlebar -->
      <div class="term-titlebar">
        <span class="term-path">C:\KEYMEME\{{ currentLobbyId }}&gt; cmd.exe</span>
        <div class="term-win-btns">
          <span class="twb">─</span>
          <span class="twb">□</span>
          <span class="twb twb-x" @click="showConfirm = true">✕</span>
        </div>
      </div>

      <div class="term-body">

        <!-- Log section -->
        <div class="term-log" ref="logEl">
          <div v-for="(entry, i) in logs" :key="i" class="term-log-line">
            <span class="tc-dim">{{ entry.ts }}&nbsp;</span>
            <span class="tc-blue">&gt;&nbsp;</span>
            <span :class="entry.cls">{{ entry.msg }}</span>
          </div>
        </div>

        <div class="term-sep" />

        <!-- Player count -->
        <div class="term-count-row">
          <span class="tc-blue">&gt;&nbsp;</span>
          <span class="tc-white">Игроков в лобби:&nbsp;</span>
          <span class="tc-ok">[&nbsp;{{ players.length }}&nbsp;/&nbsp;{{ settings.maxPlayers }}&nbsp;]</span>
          <span v-if="isHost" class="tc-host">&nbsp;&nbsp;[HOST]&nbsp;👑</span>
        </div>
        <div class="term-count-bar">
          <span class="tc-dim">&nbsp;&nbsp;&nbsp;</span>
          <span class="tc-ok">{{ '█'.repeat(players.length) }}</span><span class="tc-dim">{{ '░'.repeat(Math.max(0, settings.maxPlayers - players.length)) }}</span>
          <span class="tc-dim">&nbsp;{{ players.length }}/{{ settings.maxPlayers }}</span>
        </div>

        <!-- Player table -->
        <div class="term-table">
          <div class="term-table-head">
            <span class="col-num">&nbsp;##&nbsp;</span>
            <span class="col-sep">│</span>
            <span class="col-nick">Игрок</span>
            <span class="col-sep">│</span>
            <span class="col-role">Роль</span>
            <span class="col-sep">│</span>
            <span class="col-act"></span>
          </div>
          <div class="term-table-divider">
            ────┼───────────────────────┼────────┼────
          </div>
          <div
            v-for="(p, i) in players"
            :key="p.socketId"
            class="term-table-row"
            :class="{ 'row-me': p.socketId === mySocketId }"
          >
            <span class="col-num tc-dim">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="col-sep tc-dim">│</span>
            <span class="col-nick tc-white">{{ p.nickname }}</span>
            <span class="col-sep tc-dim">│</span>
            <span class="col-role">
              <span v-if="p.socketId === hostSocketId" class="tc-host">[HOST]</span>
              <span v-else class="tc-dim">[WAIT]</span>
            </span>
            <span class="col-sep tc-dim">│</span>
            <span class="col-act">
              <button
                v-if="isHost && p.socketId !== mySocketId"
                class="term-kick-btn"
                @click="kick(p.socketId)"
              >[X]</button>
            </span>
          </div>
          <div v-if="players.length === 0" class="tc-dim term-table-empty">загрузка...</div>
          <div class="term-table-divider" />
        </div>

        <!-- Invite -->
        <div class="term-invite">
          <div class="term-invite-row">
            <span class="tc-blue">&gt;&nbsp;</span>
            <span class="tc-dim">ССЫЛКА:&nbsp;</span>
            <span class="tc-white invite-url">{{ inviteUrl }}</span>
            <button class="term-btn-sm" @click="copyLink">
              {{ copied ? '[ ✓ ]' : '[ 📋 ]' }}
            </button>
          </div>
          <div class="term-invite-row">
            <span class="tc-blue">&gt;&nbsp;</span>
            <span class="tc-dim">КОД:&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span class="tc-ok lobby-code">{{ currentLobbyId }}</span>
          </div>
        </div>

        <div class="term-sep" />

        <!-- Actions -->
        <div class="term-actions">
          <button
            v-if="isHost"
            class="term-btn term-btn-primary"
            @click="startGame"
            :disabled="players.length < 2"
          >
            [ 🖥️&nbsp;&nbsp;НАЧАТЬ&nbsp;ИГРУ{{ players.length < 2 ? '&nbsp;(нужно&nbsp;2+)' : '' }} ]
          </button>
          <p v-if="!isHost" class="tc-dim term-waiting">
            <span class="tc-blue">&gt;&nbsp;</span>⏳ ожидание хоста...
          </p>

          <button class="term-btn term-btn-leave" @click="showConfirm = true">
            [ 🚪&nbsp;&nbsp;ВЫЙТИ ]
          </button>
        </div>

        <p v-if="error" class="tc-err">! ОШИБКА: {{ error }}</p>

        <!-- Cursor -->
        <div class="term-blank" />
        <div class="term-cursor-line">
          <span class="tc-blue">C:\KEYMEME\{{ currentLobbyId }}&gt;&nbsp;</span>
          <span class="term-caret">█</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import socket from '../socket.js'
import { gameState } from '../gameState.js'
import GameBackground from '../components/GameBackground.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

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
/* ── Layout ── */
.term-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 5;
}

.term-box {
  width: 700px;
  max-width: 100%;
  background: #0c0c0c;
  border: 1px solid #3a3a3a;
  box-shadow:
    0 0 0 1px #111,
    0 8px 40px rgba(0,0,0,0.8),
    0 0 60px rgba(80,180,255,0.08);
  animation: fadeScaleIn 0.25s ease both;
  font-family: 'Courier New', 'Lucida Console', monospace;
}

/* ── Titlebar ── */
.term-titlebar {
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}
.term-path { font-size: 12px; color: #808080; }
.term-win-btns { display: flex; gap: 2px; }
.twb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 20px;
  font-size: 11px;
  color: #808080;
  cursor: pointer;
  background: #2d2d2d;
  border: 1px solid #3a3a3a;
}
.twb:hover { background: #3a3a3a; color: #ddd; }
.twb-x:hover { background: #c42b1c; color: #fff; border-color: #c42b1c; }

/* ── Body ── */
.term-body {
  padding: 16px 20px 18px;
  font-size: 13px;
  line-height: 1.65;
}

/* ── Colors ── */
.tc-dim   { color: #636363; }
.tc-white { color: #cccccc; }
.tc-blue  { color: #569cd6; }
.tc-ok    { color: #4ec9b0; }
.tc-err   { color: #f44747; }
.tc-host  { color: #dcdcaa; }

.term-blank { height: 0.6em; }
.term-count-bar { font-size: 12px; letter-spacing: 1px; margin-bottom: 6px; }

/* ── Log ── */
.term-log {
  max-height: 90px;
  overflow-y: auto;
  margin-bottom: 4px;
}
.term-log::-webkit-scrollbar { width: 6px; }
.term-log::-webkit-scrollbar-track { background: #0c0c0c; }
.term-log::-webkit-scrollbar-thumb { background: #2a2a2a; }
.term-log-line {
  display: flex;
  align-items: baseline;
  font-size: 12px;
  line-height: 1.55;
}

/* ── Separator ── */
.term-sep {
  border: none;
  border-top: 1px solid #222;
  margin: 10px 0;
}

/* ── Count row ── */
.term-count-row {
  display: flex;
  align-items: baseline;
  font-size: 13px;
  margin-bottom: 6px;
}

/* ── Player table ── */
.term-table {
  font-size: 13px;
  margin-bottom: 4px;
}
.term-table-head,
.term-table-row {
  display: flex;
  align-items: baseline;
  gap: 0;
  color: #636363;
  font-size: 12px;
}
.term-table-head { color: #4a4a4a; margin-bottom: 0; }
.term-table-divider {
  color: #2a2a2a;
  font-size: 12px;
  margin: 0;
  letter-spacing: 0;
  white-space: nowrap;
}
.col-num  { width: 30px; flex-shrink: 0; }
.col-sep  { width: 14px; flex-shrink: 0; text-align: center; }
.col-nick { width: 160px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-role { width: 68px; flex-shrink: 0; }
.col-act  { flex: 1; }

.term-table-row.row-me .col-nick { color: #ffffff; }
.term-table-row:hover { background: #0f0f0f; }
.term-table-empty { padding: 4px 0; font-size: 12px; }

.term-kick-btn {
  background: transparent;
  border: none;
  color: #f44747;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  cursor: pointer;
  padding: 0 4px;
  opacity: 0.7;
}
.term-kick-btn:hover { opacity: 1; }

/* ── Invite ── */
.term-invite { margin-bottom: 4px; }
.term-invite-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 12px;
  flex-wrap: nowrap;
}
.invite-url {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}
.lobby-code {
  font-size: 15px;
  letter-spacing: 0.15em;
  font-weight: bold;
}

.term-btn-sm {
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #cccccc;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 1px 8px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.1s, border-color 0.1s;
}
.term-btn-sm:hover { background: #1a1a1a; border-color: #569cd6; color: #fff; }

/* ── Actions ── */
.term-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.term-btn {
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #cccccc;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 9px 16px;
  cursor: pointer;
  text-align: left;
  letter-spacing: 0.03em;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
  width: 100%;
}
.term-btn:hover:not(:disabled) { background: #1a1a1a; border-color: #569cd6; color: #fff; }
.term-btn:active:not(:disabled) { background: #142030; }
.term-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.term-btn-primary { border-color: #4ec9b0; color: #4ec9b0; }
.term-btn-primary:hover:not(:disabled) { background: #0a2020; border-color: #4ec9b0; color: #7fffdf; }
.term-btn-leave { border-color: #3a1a1a; color: #888; }
.term-btn-leave:hover { border-color: #f44747; color: #f44747; background: #1a0a0a; }

.term-waiting { font-size: 12px; margin: 2px 0; }

/* ── Cursor ── */
.term-cursor-line {
  display: flex;
  align-items: baseline;
  font-size: 13px;
}
.term-caret {
  color: #cccccc;
  animation: caretBlink 1s step-end infinite;
}
@keyframes caretBlink {
  0%, 100% { opacity: 1; } 50% { opacity: 0; }
}

@media (max-width: 740px) {
  .term-wrap { padding: 8px; }
  .term-body { padding: 12px 12px 14px; font-size: 12px; }
  .col-nick  { width: 110px; }
}
</style>
