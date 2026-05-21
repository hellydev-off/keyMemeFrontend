<template>
  <GameBackground />

  <div class="page-shell">
    <!-- ═══ NAVBAR ═══ -->
    <header class="site-nav">
      <div class="nav-inner">
        <button class="nav-logo" @click="router.push('/')">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"/>
            <path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            <path d="M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          </svg>
          <span class="nav-logo-text">KeyMeme</span>
        </button>

        <nav class="nav-links">
          <button class="nav-link" @click="router.push('/')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12l2-2m0 0 7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11 2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6"/>
            </svg>
            Главная
          </button>
          <button class="nav-link nav-link-primary" @click="router.push('/create')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
              <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
            </svg>
            Создать
          </button>
          <button class="nav-link" @click="showJoin ? closeJoin() : (showJoin = true)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            Войти
          </button>
        </nav>

        <div class="nav-clock">{{ clockTime }}</div>
      </div>

      <!-- Join panel dropdown -->
      <transition name="join-slide">
        <div v-if="showJoin" class="nav-join-panel">
          <input
            class="nav-join-input"
            v-model="joinCode"
            placeholder="Введи код лобби..."
            maxlength="20"
            autofocus
            @keydown.enter="navJoin"
          />
          <button class="btn btn-primary btn-sm" :disabled="!joinCode.trim() || joinLoading" @click="navJoin">
            {{ joinLoading ? '...' : 'Войти →' }}
          </button>
          <button class="btn btn-ghost btn-sm" @click="closeJoin">Отмена</button>
          <p v-if="joinError" class="nav-join-error">{{ joinError }}</p>
        </div>
      </transition>
    </header>

    <!-- ═══ MAIN ═══ -->
    <main class="site-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GameBackground from './components/GameBackground.vue'
import socket from './socket.js'
import { gameState } from './gameState.js'

const router        = useRouter()
const showJoin      = ref(false)
const joinCode      = ref('')
const joinLoading   = ref(false)
const joinError     = ref('')
const clockTime     = ref('')
let timer

function tick() {
  clockTime.value = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
function navJoin() {
  const code = joinCode.value.trim()
  if (!code || joinLoading.value) return
  joinError.value = ''
  joinLoading.value = true

  function onJoined({ player, lobby }) {
    socket.off('error', onError)
    joinLoading.value = false
    showJoin.value = false
    joinCode.value = ''
    if (player) gameState.myPlayer = player
    gameState.lobbyId = lobby.id
    router.push(`/lobby/${lobby.id}`)
  }
  function onError({ message }) {
    socket.off('lobby_joined', onJoined)
    joinLoading.value = false
    joinError.value = message
  }

  socket.once('lobby_joined', onJoined)
  socket.once('error', onError)

  if (socket.connected) {
    socket.emit('join_lobby', { lobbyId: code })
  } else {
    socket.once('connect', () => socket.emit('join_lobby', { lobbyId: code }))
  }
}
function closeJoin() {
  showJoin.value = false
  joinCode.value = ''
  joinError.value = ''
}

onMounted(() => { tick(); timer = setInterval(tick, 1000) })
onUnmounted(() => clearInterval(timer))
</script>

<style>
/* ── Reset & tokens ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --c-primary:       #6366f1;
  --c-primary-hover: #4f46e5;
  --c-primary-light: #eef2ff;
  --c-primary-mid:   #c7d2fe;
  --c-violet:        #7c3aed;
  --c-pink:          #ec4899;
  --c-bg:        #f5f3ff;
  --c-surface:   #ffffff;
  --c-surface-2: #f8f7ff;
  --c-border:    #e5e7eb;
  --c-border-focus: #a5b4fc;
  --c-text:       #1e1b4b;
  --c-text-2:     #374151;
  --c-text-muted: #6b7280;
  --c-text-light: #9ca3af;
  --c-success:    #059669;
  --c-success-bg: #ecfdf5;
  --c-warning:    #d97706;
  --c-warning-bg: #fffbeb;
  --c-danger:     #dc2626;
  --c-danger-bg:  #fef2f2;
  --nav-h:   60px;
  --r:       14px;
  --r-sm:    8px;
  --r-lg:    20px;
  --r-full:  9999px;
  --shadow-sm:   0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
  --shadow:      0 4px 16px rgba(99,102,241,.10), 0 2px 6px rgba(0,0,0,.04);
  --shadow-lg:   0 8px 32px rgba(99,102,241,.15), 0 4px 12px rgba(0,0,0,.06);
  --shadow-card: 0 2px 8px rgba(99,102,241,.08), 0 1px 3px rgba(0,0,0,.06);
}

html, body { height: 100%; overflow: hidden; }
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: var(--c-bg);
  color: var(--c-text);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* ── Page shell ── */
.page-shell {
  height: 100vh;
  display: grid;
  grid-template-rows: var(--nav-h) 1fr;
  grid-template-areas: "nav" "main";
  position: relative;
  overflow: hidden;
}

/* ── Navbar ── */
.site-nav {
  grid-area: nav;
  position: relative;
  z-index: 100;
  background: rgba(99,102,241,.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,.18);
  box-shadow: 0 2px 20px rgba(99,102,241,.25);
}

.nav-inner {
  height: var(--nav-h);
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: var(--r-sm);
  transition: background .15s;
  flex-shrink: 0;
}
.nav-logo:hover { background: rgba(255,255,255,.12); }
.nav-logo-text {
  font-size: 20px;
  font-weight: 800;
  color: white;
  letter-spacing: -.5px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--r-sm);
  border: none;
  background: rgba(255,255,255,.1);
  color: rgba(255,255,255,.85);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all .15s;
}
.nav-link:hover { background: rgba(255,255,255,.2); color: white; }
.nav-link-primary {
  background: rgba(255,255,255,.2);
  color: white;
  font-weight: 600;
}
.nav-link-primary:hover { background: rgba(255,255,255,.3); }

.nav-clock {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,.9);
  min-width: 48px;
  text-align: right;
  flex-shrink: 0;
}

/* Join panel */
.nav-join-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r);
  box-shadow: var(--shadow-lg);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 200;
  min-width: 360px;
}
.nav-join-input {
  flex: 1;
  padding: 8px 12px;
  border: 1.5px solid var(--c-border);
  border-radius: var(--r-sm);
  font-family: inherit;
  font-size: 14px;
  color: var(--c-text);
  background: var(--c-surface);
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.nav-join-input:focus {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px rgba(99,102,241,.15);
}
.nav-join-error {
  position: absolute;
  top: calc(100% + 6px);
  left: 0; right: 0;
  background: var(--c-danger-bg);
  border: 1px solid #fca5a5;
  border-radius: var(--r-sm);
  padding: 6px 12px;
  font-size: 13px;
  color: var(--c-danger);
  text-align: center;
}

.join-slide-enter-active, .join-slide-leave-active {
  transition: all .18s ease;
}
.join-slide-enter-from, .join-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
}

/* ── Main ── */
.site-main {
  grid-area: main;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

/* ── Shared components ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px; padding: 8px 16px; border-radius: var(--r-sm);
  font-family: inherit; font-size: 14px; font-weight: 500;
  cursor: pointer; border: none; transition: all .15s ease;
  user-select: none; white-space: nowrap; min-width: 64px; line-height: 1.4;
}
.btn:focus-visible { box-shadow: 0 0 0 3px rgba(99,102,241,.35); }
.btn:disabled { opacity: .45; cursor: not-allowed; }
.btn-primary {
  background: var(--c-primary); color: white;
  box-shadow: 0 2px 8px rgba(99,102,241,.3);
}
.btn-primary:hover:not(:disabled) {
  background: var(--c-primary-hover);
  box-shadow: 0 4px 12px rgba(99,102,241,.4);
  transform: translateY(-1px);
}
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-secondary {
  background: var(--c-surface); color: var(--c-primary);
  border: 1.5px solid var(--c-primary-mid);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--c-primary-light); border-color: var(--c-primary);
}
.btn-ghost {
  background: transparent; color: var(--c-text-muted);
  border: 1.5px solid var(--c-border);
}
.btn-ghost:hover:not(:disabled) {
  background: var(--c-surface); color: var(--c-text); border-color: #d1d5db;
}
.btn-danger {
  background: var(--c-danger); color: white;
  box-shadow: 0 2px 8px rgba(220,38,38,.25);
}
.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
  box-shadow: 0 4px 12px rgba(220,38,38,.35);
  transform: translateY(-1px);
}
.btn-success {
  background: var(--c-success); color: white;
}
.btn-success:hover:not(:disabled) { background: #047857; transform: translateY(-1px); }
.btn-sm { padding: 5px 12px; font-size: 13px; min-width: 48px; }
.btn-lg { padding: 12px 24px; font-size: 16px; font-weight: 600; border-radius: var(--r); }
.btn-full { width: 100%; }

.input {
  width: 100%; padding: 9px 12px;
  border: 1.5px solid var(--c-border); border-radius: var(--r-sm);
  font-family: inherit; font-size: 14px; color: var(--c-text);
  background: var(--c-surface); transition: border-color .15s, box-shadow .15s;
  outline: none;
}
.input:focus { border-color: var(--c-primary); box-shadow: 0 0 0 3px rgba(99,102,241,.15); }

.card {
  background: var(--c-surface); border-radius: var(--r);
  box-shadow: var(--shadow-card); border: 1px solid var(--c-border);
}

.page-center {
  min-height: 100%; display: flex;
  align-items: center; justify-content: center; padding: 20px;
}

/* ── Animations ── */
@keyframes fadeScaleIn {
  from { opacity: 0; transform: scale(.97) translateY(4px); }
  to   { opacity: 1; transform: scale(1)   translateY(0); }
}
@keyframes confettiFall {
  0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
  100% { transform: translateY(100vh)  rotate(720deg); opacity: 0; }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse {
  0%,100% { opacity: 1; } 50% { opacity: .5; }
}

.fade-enter-active { animation: fadeScaleIn .2s ease both; }
.fade-leave-active { opacity: 0; transition: opacity .15s; }

/* ── Utilities ── */
.flex           { display: flex; }
.flex-col       { flex-direction: column; }
.items-center   { align-items: center; }
.justify-center { justify-content: center; }
.justify-between{ justify-content: space-between; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.mt-2  { margin-top: 8px; }
.mt-3  { margin-top: 12px; }
.mt-4  { margin-top: 16px; }
.mb-2  { margin-bottom: 8px; }
.mb-4  { margin-bottom: 16px; }
.w-full { width: 100%; }
.text-center { text-align: center; }
.error-msg { color: var(--c-danger); font-size: 13px; }

/* Win- / xp- aliases so old views still work */
.win-btn, .xp-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px; padding: 8px 16px; border-radius: var(--r-sm);
  font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer;
  border: 1.5px solid var(--c-border); background: var(--c-surface);
  color: var(--c-text); transition: all .15s; user-select: none;
  white-space: nowrap; min-width: 64px;
}
.win-btn:hover:not(:disabled), .xp-btn:hover:not(:disabled) {
  background: var(--c-primary-light); border-color: var(--c-primary-mid); color: var(--c-primary);
}
.win-btn:disabled, .xp-btn:disabled { opacity: .45; cursor: not-allowed; }
.win-btn-lg, .xp-btn-lg { font-size: 15px; padding: 10px 20px; width: 100%; font-weight: 600; }
.win-btn-full { width: 100%; }
.win-btn-danger, .xp-btn-danger { background: var(--c-danger-bg); color: var(--c-danger); border-color: #fca5a5; }
.win-btn-danger:hover:not(:disabled), .xp-btn-danger:hover:not(:disabled) { background: var(--c-danger); color: white; }

.win-input, .xp-input {
  width: 100%; padding: 9px 12px; border: 1.5px solid var(--c-border);
  border-radius: var(--r-sm); font-family: inherit; font-size: 14px;
  color: var(--c-text); background: var(--c-surface); outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.win-input:focus, .xp-input:focus { border-color: var(--c-primary); box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
.win-input[readonly], .xp-input[readonly] { background: var(--c-surface-2); color: var(--c-text-muted); }

.win-sep, .xp-sep { border: none; border-top: 1px solid var(--c-border); margin: 10px 0; }

.win-window, .xp-window {
  background: var(--c-surface); border-radius: var(--r);
  box-shadow: var(--shadow); border: 1px solid var(--c-border);
  overflow: hidden; animation: fadeScaleIn .2s ease both;
}
.win-titlebar, .xp-titlebar {
  padding: 14px 18px; border-bottom: 1px solid var(--c-border);
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; background: var(--c-surface);
}
.win-titlebar-left, .xp-titlebar-left {
  display: flex; align-items: center; gap: 8px;
  font-size: 15px; font-weight: 600; color: var(--c-text);
  overflow: hidden; flex: 1;
}
.win-title-icon, .xp-title-icon { flex-shrink: 0; color: var(--c-primary); }
.win-title-text, .xp-title-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.win-title-btns, .xp-title-btns { display: flex; gap: 4px; flex-shrink: 0; }
.win-ctrl, .xp-ctrl {
  width: 28px; height: 28px; border-radius: var(--r-full);
  border: none; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-text-muted); font-size: 14px; transition: background .12s; padding: 0;
}
.win-ctrl:hover, .xp-ctrl:hover { background: var(--c-surface-2); }
.win-ctrl-close:hover, .xp-ctrl-close:hover { background: var(--c-danger-bg); color: var(--c-danger); }
.win-body, .xp-body { padding: 20px; background: var(--c-surface); }

.win-progress, .xp-progress-bar {
  height: 6px; background: var(--c-primary-light);
  border-radius: var(--r-full); overflow: hidden;
}
.win-progress-fill, .xp-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-primary), var(--c-violet));
  border-radius: var(--r-full); transition: width .35s;
}

.win-list-row, .xp-list-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-bottom: 1px solid var(--c-border);
  font-size: 14px; transition: background .1s;
}
.win-list-row:hover, .xp-list-row:hover { background: var(--c-primary-light); }

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--c-primary-mid); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--c-primary); }

@media (max-width: 640px) {
  .nav-links { gap: 2px; }
  .nav-link  { padding: 5px 8px; font-size: 13px; }
  .nav-logo-text { font-size: 17px; }
  .page-center { padding: 8px; }
}
@media (max-width: 400px) {
  .nav-link span:not(.nav-logo-text) { display: none; }
}
</style>
