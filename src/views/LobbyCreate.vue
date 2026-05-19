<template>
  <div class="create-wrap">
    <div class="win-window create-window">

      <!-- Titlebar -->
      <div class="win-titlebar">
        <div class="win-titlebar-left">
          <span class="win-title-icon"><PixelIcon name="gamepad" :size="14" /></span>
          <span class="win-title-text">Создать игру — Настройки лобби</span>
        </div>
        <div class="win-title-btns">
          <button class="win-ctrl">─</button>
          <button class="win-ctrl">□</button>
          <button class="win-ctrl win-ctrl-close" @click="router.push('/')">✕</button>
        </div>
      </div>

      <div class="create-body">

        <!-- Lobby name -->
        <div class="field-group">
          <label class="field-label"><PixelIcon name="pencil" :size="16" /> Название лобби</label>
          <input
            class="xp-input field-input"
            v-model="lobbyName"
            placeholder="Новая игра"
            maxlength="40"
          />
        </div>

        <hr class="win-sep" />

        <!-- Max players -->
        <div class="field-group">
          <label class="field-label"><PixelIcon name="people" :size="16" /> Максимум игроков</label>
          <div class="spinner-row">
            <button class="spin-btn" @click="settings.maxPlayers = Math.max(2, settings.maxPlayers - 1)">◀</button>
            <div class="spin-display">
              <span class="spin-value">{{ settings.maxPlayers }}</span>
              <div class="spin-bar">
                <div
                  class="spin-fill"
                  :style="{ width: ((settings.maxPlayers - 2) / 8 * 100) + '%' }"
                />
              </div>
              <span class="spin-hint">из 10</span>
            </div>
            <button class="spin-btn" @click="settings.maxPlayers = Math.min(10, settings.maxPlayers + 1)">▶</button>
          </div>
        </div>

        <hr class="win-sep" />

        <!-- Points to win -->
        <div class="field-group">
          <label class="field-label"><PixelIcon name="star" :size="16" /> Очков для победы</label>
          <div class="stars-row">
            <button
              v-for="n in 3" :key="n"
              class="star-btn"
              :class="{ active: n <= settings.pointsToWin }"
              @click="settings.pointsToWin = n"
            >
              {{ n <= settings.pointsToWin ? '★' : '☆' }}
            </button>
            <span class="star-label">{{ settings.pointsToWin }} {{ settings.pointsToWin === 1 ? 'очко' : 'очка' }}</span>
          </div>
        </div>

        <hr class="win-sep" />

        <!-- Summary -->
        <div class="summary-box">
          <div class="summary-title">Итог:</div>
          <div class="summary-row">
            <span class="summary-key">Лобби</span>
            <span class="summary-val">{{ lobbyName || 'Новая игра' }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-key">Игроков</span>
            <span class="summary-val">до {{ settings.maxPlayers }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-key">Победа</span>
            <span class="summary-val">{{ settings.pointsToWin }} {{ settings.pointsToWin === 1 ? 'очко' : 'очка' }}</span>
          </div>
        </div>

        <p v-if="error" class="error-msg" style="margin-top:6px">{{ error }}</p>

        <!-- Actions -->
        <div class="create-actions">
          <button class="xp-btn" @click="router.push('/')">← Назад</button>
          <button class="xp-btn create-btn" :disabled="loading" @click="create">
            <PixelIcon v-if="loading" name="hourglass" :size="14" />
            <PixelIcon v-else name="rocket" :size="14" />
            {{ loading ? 'Создаём...' : 'Создать игру' }}
          </button>
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
import PixelIcon from '../components/PixelIcon.vue'

const router    = useRouter()
const loading   = ref(false)
const error     = ref('')
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
.create-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 5;
}

.create-window {
  width: 680px;
  max-width: 100%;
}

.create-body {
  background: #d4d0c8;
  padding: 26px 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Field group */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.field-label {
  font-family: Tahoma, sans-serif;
  font-size: 17px;
  font-weight: bold;
  color: #222;
}
.field-input {
  font-size: 16px;
  padding: 6px 10px;
}

/* Spinner */
.spinner-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.spin-btn {
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  width: 42px;
  height: 42px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.spin-btn:hover { background: #e0dcd4; }
.spin-btn:active {
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
}

.spin-display {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}
.spin-value {
  font-family: Tahoma, sans-serif;
  font-size: 28px;
  font-weight: bold;
  color: #003399;
  min-width: 36px;
  text-align: center;
}
.spin-bar {
  flex: 1;
  height: 18px;
  background: white;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  overflow: hidden;
}
.spin-fill {
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    #0a4ee8 0px, #0a4ee8 8px,
    #1a6aff 8px, #1a6aff 10px
  );
  transition: width 0.15s;
}
.spin-hint {
  font-family: Tahoma, sans-serif;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

/* Stars */
.stars-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.star-btn {
  font-size: 38px;
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  padding: 0;
  line-height: 1;
  transition: transform 0.1s, color 0.1s;
}
.star-btn.active { color: #f4a800; }
.star-btn:hover  { transform: scale(1.2); }
.star-label {
  font-family: Tahoma, sans-serif;
  font-size: 16px;
  color: #555;
  margin-left: 8px;
}

/* Summary */
.summary-box {
  background: white;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.summary-title {
  font-family: Tahoma, sans-serif;
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.summary-row {
  display: flex;
  gap: 12px;
  font-family: Tahoma, sans-serif;
  font-size: 15px;
}
.summary-key { color: #666; min-width: 90px; }
.summary-val { color: #003399; font-weight: bold; }

/* Actions */
.create-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.create-btn {
  flex: 1;
  font-size: 17px;
  font-weight: bold;
  padding: 12px 20px;
  color: #003399;
}
.create-btn:not(:disabled):hover {
  background: #e8f0ff;
}

@media (max-width: 520px) {
  .create-wrap { padding: 8px; }
  .create-body { padding: 14px 14px 16px; }
  .create-actions { flex-direction: column; }
  .create-btn { flex: none; }
}
</style>
