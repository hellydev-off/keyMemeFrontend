<template>
  <div class="home-wrap">
    <div class="home-card">

      <!-- Hero -->
      <div class="home-hero">
        <div class="hero-icon">
          <PixelIcon name="music" :size="40" color="white" />
        </div>
        <div>
          <h1 class="hero-title">KeyMeme</h1>
          <p class="hero-sub">Угадай ситуацию — выбери звук — победи!</p>
        </div>
      </div>

      <!-- Loading steps -->
      <div class="boot-panel">
        <div v-for="(item, i) in bootItems" :key="i" class="boot-row">
          <div class="boot-indicator">
            <span v-if="item.status === 'ok'" class="bi-ok">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>
            </span>
            <span v-else class="bi-spin">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </span>
          </div>
          <span class="boot-text">{{ item.text }}</span>
        </div>
      </div>

      <!-- Action buttons -->
      <template v-if="showButtons">
        <div class="home-actions">
          <button class="action-card action-primary" @click="router.push('/create')">
            <div class="action-icon-wrap action-icon-primary">
              <PixelIcon name="rocket" :size="28" color="white" />
            </div>
            <div class="action-content">
              <span class="action-title">Создать игру</span>
              <span class="action-desc">Настроить и запустить лобби</span>
            </div>
            <svg class="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          <button class="action-card" @click="toggleJoin">
            <div class="action-icon-wrap action-icon-secondary">
              <PixelIcon name="link" :size="28" color="white" />
            </div>
            <div class="action-content">
              <span class="action-title">Войти по коду</span>
              <span class="action-desc">Присоединиться к лобби друга</span>
            </div>
            <svg class="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <!-- Join input panel -->
        <transition name="slide">
          <div v-if="showJoin" class="join-panel">
            <label class="join-label">Код лобби</label>
            <div class="join-row">
              <input
                class="input join-input"
                v-model="joinCode"
                placeholder="Вставь код сюда..."
                maxlength="20"
                autofocus
                @keydown.enter="joinByCode"
              />
              <button class="btn btn-primary" :disabled="!joinCode.trim() || joinLoading" @click="joinByCode">
                {{ joinLoading ? '...' : 'Войти →' }}
              </button>
            </div>
            <p v-if="joinError" class="error-msg">{{ joinError }}</p>
          </div>
        </transition>
      </template>

      <!-- Footer -->
      <div class="home-footer">
        <span>KeyMeme v1.0.2026</span>
        <span>© 2026 Avatar Lab</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import socket from '../socket.js'
import { gameState } from '../gameState.js'
import PixelIcon from '../components/PixelIcon.vue'

const router      = useRouter()
const joinCode    = ref('')
const joinError   = ref('')
const joinLoading = ref(false)
const showJoin    = ref(false)
const bootItems = ref([])
const showButtons = ref(false)

const steps = [
  { text: 'Инициализация системы',   loadMs: 400 },
  { text: 'Загрузка звуков (54/54)', loadMs: 300 },
  { text: 'Проверка соединения',     loadMs: 500 },
  { text: 'Система готова',          loadMs: 0, done: true },
]

onMounted(async () => {
  for (const step of steps) {
    bootItems.value.push({ text: step.text, status: step.done ? 'ok' : 'loading' })
    const idx = bootItems.value.length - 1
    if (step.loadMs) {
      await new Promise(r => setTimeout(r, step.loadMs))
      bootItems.value[idx] = { ...bootItems.value[idx], status: 'ok' }
      await new Promise(r => setTimeout(r, 50))
    }
  }
  await new Promise(r => setTimeout(r, 150))
  showButtons.value = true
})

function toggleJoin() {
  showJoin.value = !showJoin.value
  if (!showJoin.value) { joinCode.value = ''; joinError.value = '' }
}
function joinByCode() {
  const code = joinCode.value.trim()
  if (!code || joinLoading.value) return
  joinError.value = ''
  joinLoading.value = true

  function onJoined({ player, lobby }) {
    socket.off('error', onError)
    joinLoading.value = false
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
</script>

<style scoped>
.home-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 5;
}

.home-card {
  width: 520px;
  max-width: 100%;
  background: var(--c-surface);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--c-border);
  overflow: hidden;
  animation: fadeScaleIn .3s ease both;
}

/* Hero */
.home-hero {
  background: linear-gradient(135deg, var(--c-primary), var(--c-violet));
  padding: 28px 28px 24px;
  display: flex;
  align-items: center;
  gap: 18px;
}
.hero-icon {
  width: 68px; height: 68px;
  background: rgba(255,255,255,.15);
  border-radius: var(--r);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
}
.hero-title {
  font-size: 32px;
  font-weight: 800;
  color: white;
  letter-spacing: -1px;
}
.hero-sub {
  font-size: 14px;
  color: rgba(255,255,255,.8);
  margin-top: 4px;
  line-height: 1.4;
}

/* Boot panel */
.boot-panel {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid var(--c-border);
  background: var(--c-surface-2);
}
.boot-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--c-text-muted);
}
.boot-indicator {
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.bi-ok { color: var(--c-success); }
.bi-spin {
  color: var(--c-primary);
  animation: spin .7s linear infinite;
  display: flex; align-items: center;
}
.boot-text { flex: 1; }

/* Actions */
.home-actions {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: var(--r);
  border: 1.5px solid var(--c-border);
  background: var(--c-surface);
  cursor: pointer;
  text-align: left;
  transition: all .15s;
  width: 100%;
}
.action-card:hover {
  border-color: var(--c-primary-mid);
  background: var(--c-primary-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(99,102,241,.12);
}
.action-card:active { transform: translateY(0); }

.action-icon-wrap {
  width: 48px; height: 48px;
  border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.action-icon-primary  { background: linear-gradient(135deg, var(--c-primary), var(--c-violet)); }
.action-icon-secondary { background: linear-gradient(135deg, #0ea5e9, #6366f1); }

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.action-title { font-size: 15px; font-weight: 600; color: var(--c-text); }
.action-desc  { font-size: 12px; color: var(--c-text-muted); }

.action-arrow { color: var(--c-text-light); flex-shrink: 0; transition: transform .15s; }
.action-card:hover .action-arrow { transform: translateX(3px); color: var(--c-primary); }

/* Join panel */
.join-panel {
  margin: 0 20px 16px;
  padding: 14px 16px;
  background: var(--c-primary-light);
  border: 1px solid var(--c-primary-mid);
  border-radius: var(--r);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.join-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-primary);
}
.join-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.join-input { flex: 1; font-size: 15px; padding: 9px 12px; }

/* Footer */
.home-footer {
  padding: 10px 24px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--c-text-light);
  border-top: 1px solid var(--c-border);
  background: var(--c-surface-2);
}

/* Transitions */
.slide-enter-active, .slide-leave-active { transition: all .2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 560px) {
  .home-wrap  { padding: 8px; }
  .home-hero  { padding: 20px; gap: 12px; }
  .hero-title { font-size: 26px; }
  .hero-icon  { width: 52px; height: 52px; }
  .action-card { padding: 12px; gap: 10px; }
  .action-icon-wrap { width: 40px; height: 40px; }
  .action-title { font-size: 14px; }
  .action-desc  { font-size: 11px; }
  .join-row { flex-direction: column; }
  .join-input { font-size: 14px; }
  .boot-panel { padding: 12px 16px; }
}
@media (max-width: 360px) {
  .home-wrap  { padding: 0; }
  .home-card  { border-radius: 0; min-height: 100dvh; }
  .home-hero  { padding: 14px; gap: 10px; }
  .hero-title { font-size: 22px; }
  .hero-sub   { font-size: 12px; }
  .hero-icon  { width: 44px; height: 44px; }
  .home-actions { padding: 10px 12px; gap: 8px; }
  .action-card  { padding: 10px; gap: 8px; }
  .action-icon-wrap { width: 34px; height: 34px; }
  .action-title { font-size: 13px; }
  .action-desc  { display: none; }
  .boot-panel { padding: 10px 12px; gap: 6px; }
  .boot-row   { font-size: 12px; }
  .home-footer { padding: 8px 12px; font-size: 10px; }
}
</style>
