<template>
  <GameBackground />

  <div class="term-wrap">
    <div class="term-box">

      <!-- Titlebar -->
      <div class="term-titlebar">
        <span class="term-path">C:\KEYMEME\create&gt; cmd.exe</span>
        <div class="term-win-btns">
          <span class="twb">─</span>
          <span class="twb">□</span>
          <span class="twb twb-x" @click="router.push('/')">✕</span>
        </div>
      </div>

      <div class="term-body">

        <p class="tc-dim">Мастер создания лобби [Key Meme v1.0]</p>
        <p class="tc-dim">Заполни параметры и нажми СОЗДАТЬ.</p>
        <div class="term-blank" />

        <!-- Lobby name -->
        <div class="term-field">
          <div class="term-field-label">
            <span class="tc-blue">&gt;&nbsp;</span>
            <span class="tc-white">Название лобби:</span>
          </div>
          <div class="term-input-row">
            <span class="tc-dim prompt-indent">│&nbsp;&nbsp;</span>
            <input
              class="term-input term-input-wide"
              v-model="lobbyName"
              placeholder="Новая игра"
              maxlength="40"
            />
          </div>
        </div>

        <div class="term-blank" />

        <!-- Max players -->
        <div class="term-field">
          <div class="term-field-label">
            <span class="tc-blue">&gt;&nbsp;</span>
            <span class="tc-white">Максимум игроков:</span>
            <span class="tc-dim">&nbsp;(2–10)</span>
          </div>
          <div class="term-spinner-row">
            <span class="tc-dim prompt-indent">│&nbsp;&nbsp;</span>
            <button class="term-spin-btn" @click="settings.maxPlayers = Math.max(2, settings.maxPlayers - 1)">[ ─ ]</button>
            <span class="term-spin-val tc-ok">{{ String(settings.maxPlayers).padStart(2, '0') }}</span>
            <button class="term-spin-btn" @click="settings.maxPlayers = Math.min(10, settings.maxPlayers + 1)">[ + ]</button>
            <span class="tc-dim spin-bar">{{ '█'.repeat(settings.maxPlayers - 1) }}{{ '░'.repeat(10 - settings.maxPlayers) }}</span>
          </div>
        </div>

        <div class="term-blank" />

        <!-- Points to win -->
        <div class="term-field">
          <div class="term-field-label">
            <span class="tc-blue">&gt;&nbsp;</span>
            <span class="tc-white">Очков для победы:</span>
            <span class="tc-dim">&nbsp;(1–3)</span>
          </div>
          <div class="term-spinner-row">
            <span class="tc-dim prompt-indent">│&nbsp;&nbsp;</span>
            <button class="term-spin-btn" @click="settings.pointsToWin = Math.max(1, settings.pointsToWin - 1)">[ ─ ]</button>
            <span class="term-spin-val tc-ok">{{ String(settings.pointsToWin).padStart(2, '0') }}</span>
            <button class="term-spin-btn" @click="settings.pointsToWin = Math.min(3, settings.pointsToWin + 1)">[ + ]</button>
            <span class="tc-dim spin-bar">{{ '★'.repeat(settings.pointsToWin) }}{{ '☆'.repeat(3 - settings.pointsToWin) }}</span>
          </div>
        </div>

        <div class="term-blank" />
        <div class="term-sep" />

        <!-- Summary -->
        <div class="term-summary">
          <div class="term-sum-row">
            <span class="tc-dim">&nbsp;&nbsp;Название&nbsp;&nbsp;&nbsp;</span>
            <span class="tc-dim">│</span>
            <span class="tc-white">&nbsp;{{ lobbyName || 'Новая игра' }}</span>
          </div>
          <div class="term-sum-row">
            <span class="tc-dim">&nbsp;&nbsp;Игроков&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span class="tc-dim">│</span>
            <span class="tc-ok">&nbsp;до {{ settings.maxPlayers }}</span>
          </div>
          <div class="term-sum-row">
            <span class="tc-dim">&nbsp;&nbsp;Победа при&nbsp;</span>
            <span class="tc-dim">│</span>
            <span class="tc-ok">&nbsp;{{ settings.pointsToWin }} очк.</span>
          </div>
        </div>

        <div class="term-sep" />

        <!-- Buttons -->
        <div class="term-actions">
          <button class="term-btn" @click="router.push('/')">
            [ ← НАЗАД ]
          </button>
          <button class="term-btn term-btn-primary" @click="create" :disabled="loading">
            [ 🎮&nbsp;&nbsp;{{ loading ? 'СОЗДАЁМ...' : 'СОЗДАТЬ ИГРУ' }} ]
          </button>
        </div>

        <p v-if="error" class="tc-err">! ОШИБКА: {{ error }}</p>

        <div class="term-blank" />
        <div class="term-cursor-line">
          <span class="tc-blue">C:\KEYMEME\create&gt;&nbsp;</span>
          <span class="term-caret">█</span>
        </div>

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

const router  = useRouter()
const loading = ref(false)
const error   = ref('')
const lobbyName = ref('Новая игра')
const settings  = reactive({ maxPlayers: 10, pointsToWin: 3 })

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
  width: 580px;
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

/* Titlebar */
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

/* Body */
.term-body {
  padding: 18px 22px 20px;
  font-size: 14px;
  line-height: 1.7;
}

/* Colors */
.tc-dim   { color: #555; }
.tc-white { color: #ccc; }
.tc-blue  { color: #569cd6; }
.tc-ok    { color: #4ec9b0; }
.tc-err   { color: #f44747; font-size: 13px; margin-top: 6px; }

.term-blank { height: 0.6em; }
.term-sep {
  border: none;
  border-top: 1px solid #222;
  margin: 10px 0;
}

/* Fields */
.term-field { display: flex; flex-direction: column; gap: 4px; }
.term-field-label { display: flex; align-items: baseline; gap: 0; font-size: 14px; }
.prompt-indent { flex-shrink: 0; }

/* Text input */
.term-input-row { display: flex; align-items: center; }
.term-input {
  background: #0c0c0c;
  border: none;
  border-bottom: 1px solid #569cd6;
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 2px 6px;
  outline: none;
  caret-color: #ccc;
}
.term-input::placeholder { color: #383838; }
.term-input-wide { width: 340px; }

/* Spinner */
.term-spinner-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.term-spin-btn {
  background: transparent;
  border: 1px solid #333;
  color: #888;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 2px 6px;
  cursor: pointer;
  transition: border-color 0.1s, color 0.1s;
  flex-shrink: 0;
}
.term-spin-btn:hover { border-color: #569cd6; color: #ccc; }
.term-spin-btn:active { background: #1a1a1a; }
.term-spin-val {
  font-size: 18px;
  font-weight: bold;
  min-width: 28px;
  text-align: center;
  letter-spacing: 0.05em;
}
.spin-bar {
  font-size: 12px;
  letter-spacing: 2px;
}

/* Summary */
.term-summary { display: flex; flex-direction: column; gap: 2px; font-size: 13px; }
.term-sum-row { display: flex; align-items: baseline; }

/* Actions */
.term-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.term-btn {
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #888;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 9px 16px;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}
.term-btn:hover { background: #1a1a1a; border-color: #569cd6; color: #fff; }
.term-btn-primary {
  border-color: #4ec9b0;
  color: #4ec9b0;
  flex: 1;
}
.term-btn-primary:hover { background: #0a2020; border-color: #4ec9b0; color: #7fffdf; }
.term-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Cursor */
.term-cursor-line { display: flex; align-items: baseline; font-size: 14px; }
.term-caret {
  color: #ccc;
  animation: caretBlink 1s step-end infinite;
}
@keyframes caretBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

@media (max-width: 620px) {
  .term-wrap { padding: 8px; }
  .term-body { padding: 14px 14px 16px; font-size: 13px; }
  .term-input-wide { width: 200px; }
  .term-actions { flex-direction: column; }
}
</style>
