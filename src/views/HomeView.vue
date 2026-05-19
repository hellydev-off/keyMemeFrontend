<template>
  <div class="home-wrap">
    <div class="win-window home-window">

      <!-- Titlebar -->
      <div class="win-titlebar">
        <div class="win-titlebar-left">
          <span class="win-title-icon"><PixelIcon name="gamepad" :size="14" /></span>
          <span class="win-title-text">KeyMeme — Добро пожаловать!</span>
        </div>
        <div class="win-title-btns">
          <button class="win-ctrl">─</button>
          <button class="win-ctrl">□</button>
          <button class="win-ctrl win-ctrl-close">✕</button>
        </div>
      </div>

      <div class="home-body">

        <!-- Logo area -->
        <div class="home-logo-row">
          <div class="home-logo-icon"><PixelIcon name="music" :size="64" color="#003399" /></div>
          <div>
            <div class="home-title">KeyMeme</div>
            <div class="home-subtitle">Угадай ситуацию — выбери звук — победи!</div>
          </div>
        </div>

        <hr class="win-sep" />

        <!-- Boot lines -->
        <div class="boot-lines">
          <div v-for="(item, i) in bootItems" :key="i" class="boot-line">
            <span class="boot-bullet">▶</span>
            <span class="boot-text">{{ item.text }}</span>
            <span v-if="item.status === 'loading'" class="boot-dots">...</span>
            <span v-else-if="item.status === 'ok'"   class="boot-ok">✓</span>
          </div>
        </div>

        <!-- Main buttons -->
        <template v-if="showButtons">
          <hr class="win-sep" />
          <div class="home-btns">
            <button class="home-action-btn home-btn-primary" @click="router.push('/create')">
              <span class="btn-icon"><PixelIcon name="gamepad" :size="44" color="#003399" /></span>
              <div class="btn-text">
                <span class="btn-main">Создать игру</span>
                <span class="btn-sub">Настроить и запустить лобби</span>
              </div>
            </button>
            <button class="home-action-btn" @click="toggleJoin">
              <span class="btn-icon"><PixelIcon name="link" :size="44" color="#003399" /></span>
              <div class="btn-text">
                <span class="btn-main">Войти по коду</span>
                <span class="btn-sub">Введи код от друга</span>
              </div>
            </button>
          </div>

          <!-- Join input -->
          <transition name="slide">
            <div v-if="showJoin" class="join-panel">
              <label class="join-label">Код лобби:</label>
              <div class="join-row">
                <input
                  class="xp-input join-input"
                  v-model="joinCode"
                  placeholder="Вставь код сюда..."
                  maxlength="20"
                  autofocus
                  @keydown.enter="joinByCode"
                />
                <button class="xp-btn join-go-btn" :disabled="!joinCode.trim()" @click="joinByCode">
                  Войти →
                </button>
              </div>
              <p v-if="joinError" class="error-msg">{{ joinError }}</p>
            </div>
          </transition>
        </template>

      </div>

      <!-- Status bar -->
      <div class="home-statusbar">
        <div class="status-cell">KeyMeme v1.0.2026</div>
        <div class="status-cell">© 2026 Avatar Lab</div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PixelIcon from '../components/PixelIcon.vue'

const router    = useRouter()
const joinCode  = ref('')
const joinError = ref('')
const showJoin  = ref(false)
const bootItems = ref([])
const showButtons = ref(false)

const steps = [
  { text: 'Инициализация системы',   loadMs: 500 },
  { text: 'Загрузка звуков (54/54)', loadMs: 350 },
  { text: 'Проверка соединения',     loadMs: 600 },
  { text: 'Система готова.',         loadMs: 0, done: true },
]

onMounted(async () => {
  for (const step of steps) {
    bootItems.value.push({ text: step.text, status: step.done ? 'ok' : 'loading' })
    const idx = bootItems.value.length - 1
    if (step.loadMs) {
      await new Promise(r => setTimeout(r, step.loadMs))
      bootItems.value[idx] = { ...bootItems.value[idx], status: 'ok' }
      await new Promise(r => setTimeout(r, 60))
    }
  }
  await new Promise(r => setTimeout(r, 200))
  showButtons.value = true
})

function toggleJoin() {
  showJoin.value = !showJoin.value
  if (!showJoin.value) joinCode.value = ''
}

function joinByCode() {
  const code = joinCode.value.trim()
  if (!code) return
  joinError.value = ''
  router.push(`/join/${code}`)
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

.home-window {
  width: 780px;
  max-width: 100%;
}

.home-body {
  padding: 26px 32px 20px;
  background: #d4d0c8;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Logo row */
.home-logo-row {
  display: flex;
  align-items: center;
  gap: 18px;
}
.home-logo-icon {
  font-size: 64px;
  line-height: 1;
  filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.2));
}
.home-title {
  font-family: 'Tahoma', sans-serif;
  font-size: 36px;
  font-weight: bold;
  color: #003399;
  text-shadow: 1px 1px 0 #fff;
  letter-spacing: 1px;
}
.home-subtitle {
  font-family: Tahoma, sans-serif;
  font-size: 16px;
  color: #444;
  margin-top: 4px;
}

/* Boot lines */
.boot-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: white;
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-bottom: 2px solid #fff;
  border-right: 2px solid #fff;
  padding: 10px 16px;
}
.boot-line {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #333;
}
.boot-bullet { color: #0055cc; font-size: 12px; }
.boot-text   { flex: 1; }
.boot-ok     { color: #008000; font-weight: bold; }
.boot-dots   { color: #888; animation: dots 1s steps(3) infinite; }
@keyframes dots { 0% { opacity: 0.3 } 100% { opacity: 1 } }

/* Action buttons */
.home-btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.home-action-btn {
  display: flex;
  align-items: center;
  gap: 18px;
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  padding: 16px 22px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.08s;
  font-family: Tahoma, sans-serif;
}
.home-action-btn:hover {
  background: #e8e4dc;
}
.home-action-btn:active {
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  background: #c8c4bc;
}
.home-btn-primary {
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  outline: 2px solid #0055cc;
  outline-offset: -4px;
}

.btn-icon { font-size: 44px; flex-shrink: 0; line-height: 1; }
.btn-text  { display: flex; flex-direction: column; gap: 3px; }
.btn-main  { font-size: 18px; font-weight: bold; color: #000; }
.btn-sub   { font-size: 13px; color: #555; }

/* Join panel */
.join-panel {
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.join-label {
  font-family: Tahoma, sans-serif;
  font-size: 15px;
  color: #222;
  font-weight: bold;
}
.join-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.join-input    { flex: 1; font-size: 16px; padding: 6px 10px; }
.join-go-btn   { white-space: nowrap; min-width: 100px; font-size: 15px; padding: 6px 16px; }

/* Status bar */
.home-statusbar {
  display: flex;
  background: #d4d0c8;
  border-top: 1px solid #808080;
  padding: 3px 6px;
  gap: 4px;
}
.status-cell {
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #444;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  padding: 1px 8px;
  flex: 1;
  text-align: center;
}

/* Slide transition */
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 600px) {
  .home-wrap   { padding: 8px; }
  .home-title  { font-size: 22px; }
  .btn-icon    { font-size: 24px; }
  .home-logo-icon { font-size: 36px; }
}
</style>
