<template>
  <div class="create-wrap">
    <div class="create-card">

      <!-- Header -->
      <div class="create-header">
        <button class="back-btn" @click="router.push('/')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div class="header-title">
          <PixelIcon name="gamepad" :size="20" color="var(--c-primary)" />
          <span>Новая игра</span>
        </div>
      </div>

      <div class="create-body">

        <!-- Lobby name -->
        <div class="field">
          <label class="field-label">
            <PixelIcon name="pencil" :size="15" color="var(--c-primary)" />
            Название лобби
          </label>
          <input
            class="input"
            v-model="lobbyName"
            placeholder="Новая игра"
            maxlength="40"
          />
        </div>

        <!-- Max players -->
        <div class="field">
          <label class="field-label">
            <PixelIcon name="people" :size="15" color="var(--c-primary)" />
            Максимум игроков
          </label>
          <div class="counter-row">
            <button class="counter-btn" @click="settings.maxPlayers = Math.max(3, settings.maxPlayers - 1)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14"/></svg>
            </button>
            <div class="counter-display">
              <span class="counter-value">{{ settings.maxPlayers }}</span>
              <div class="counter-track">
                <div class="counter-fill" :style="{ width: ((settings.maxPlayers - 3) / 7 * 100) + '%' }" />
              </div>
              <span class="counter-hint">из 10</span>
            </div>
            <button class="counter-btn" @click="settings.maxPlayers = Math.min(10, settings.maxPlayers + 1)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </div>

        <!-- Points to win -->
        <div class="field">
          <label class="field-label">
            <PixelIcon name="star" :size="15" color="var(--c-primary)" />
            Очков для победы
          </label>
          <div class="stars-row">
            <button
              v-for="n in 3" :key="n"
              class="star-btn"
              :class="{ active: n <= settings.pointsToWin }"
              @click="settings.pointsToWin = n"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" :fill="n <= settings.pointsToWin ? '#f59e0b' : 'none'" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
              </svg>
            </button>
            <span class="stars-label">{{ settings.pointsToWin }} {{ settings.pointsToWin === 1 ? 'очко' : 'очка' }}</span>
          </div>
        </div>

        <!-- Summary -->
        <div class="summary-box">
          <div class="summary-title">Итог настроек</div>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="si-key">Лобби</span>
              <span class="si-val">{{ lobbyName || 'Новая игра' }}</span>
            </div>
            <div class="summary-item">
              <span class="si-key">Игроков</span>
              <span class="si-val">до {{ settings.maxPlayers }}</span>
            </div>
            <div class="summary-item">
              <span class="si-key">Победа</span>
              <span class="si-val">{{ settings.pointsToWin }} {{ settings.pointsToWin === 1 ? 'очко' : 'очка' }}</span>
            </div>
          </div>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <!-- Actions -->
        <div class="create-actions">
          <button class="btn btn-ghost" @click="router.push('/')">← Назад</button>
          <button class="btn btn-primary create-go-btn" :disabled="loading" @click="create">
            <PixelIcon v-if="loading" name="hourglass" :size="16" color="white" />
            <PixelIcon v-else name="rocket" :size="16" color="white" />
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
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 20px; z-index: 5;
}

.create-card {
  width: 520px;
  max-width: 100%;
  background: var(--c-surface);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--c-border);
  animation: fadeScaleIn .25s ease both;
  overflow: hidden;
}

/* Header */
.create-header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--c-border);
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--c-surface-2);
}
.back-btn {
  width: 34px; height: 34px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--c-border);
  background: var(--c-surface);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-text-muted);
  transition: all .12s;
  flex-shrink: 0;
}
.back-btn:hover { background: var(--c-primary-light); border-color: var(--c-primary-mid); color: var(--c-primary); }
.header-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 16px; font-weight: 700; color: var(--c-text);
}

/* Body */
.create-body {
  padding: 22px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Field */
.field { display: flex; flex-direction: column; gap: 8px; }
.field-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600;
  color: var(--c-text-muted); text-transform: uppercase; letter-spacing: .04em;
}

/* Counter */
.counter-row { display: flex; align-items: center; gap: 12px; }
.counter-btn {
  width: 36px; height: 36px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--c-border);
  background: var(--c-surface);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-text-muted);
  transition: all .12s;
  flex-shrink: 0;
}
.counter-btn:hover { background: var(--c-primary-light); border-color: var(--c-primary-mid); color: var(--c-primary); }
.counter-display { flex: 1; display: flex; align-items: center; gap: 10px; }
.counter-value {
  font-size: 28px; font-weight: 800;
  color: var(--c-primary); min-width: 38px; text-align: center;
}
.counter-track {
  flex: 1; height: 6px; background: var(--c-primary-light);
  border-radius: var(--r-full); overflow: hidden;
}
.counter-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-primary), var(--c-violet));
  border-radius: var(--r-full);
  transition: width .15s;
}
.counter-hint { font-size: 12px; color: var(--c-text-light); white-space: nowrap; }

/* Stars */
.stars-row { display: flex; align-items: center; gap: 4px; }
.star-btn {
  background: none; border: none; cursor: pointer; padding: 2px;
  border-radius: 6px; transition: transform .1s;
}
.star-btn:hover { transform: scale(1.2); }
.stars-label { font-size: 14px; color: var(--c-text-muted); margin-left: 6px; }

/* Summary */
.summary-box {
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  border-radius: var(--r);
  padding: 14px 16px;
}
.summary-title {
  font-size: 11px; font-weight: 600; color: var(--c-text-light);
  text-transform: uppercase; letter-spacing: .05em; margin-bottom: 10px;
}
.summary-grid { display: flex; flex-direction: column; gap: 6px; }
.summary-item { display: flex; justify-content: space-between; align-items: center; }
.si-key { font-size: 13px; color: var(--c-text-muted); }
.si-val { font-size: 13px; font-weight: 600; color: var(--c-primary); }

/* Actions */
.create-actions { display: flex; gap: 10px; }
.create-go-btn { flex: 1; font-size: 15px; font-weight: 600; padding: 12px 20px; }

@media (max-width: 560px) {
  .create-wrap { padding: 8px; }
  .create-body { padding: 16px; }
  .create-actions { flex-direction: column; }
}
</style>
