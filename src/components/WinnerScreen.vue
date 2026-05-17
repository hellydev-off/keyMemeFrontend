<template>
  <div class="winner-wrap">
    <!-- Confetti for gameover -->
    <div class="confetti-layer" v-if="isGameOver" aria-hidden="true">
      <div v-for="i in 36" :key="i" class="confetti-piece" :style="confettiStyle(i)" />
    </div>

    <WinWindow
      :title="isGameOver ? '🏆 Победитель игры!' : '🎉 Победитель раунда!'"
      icon="🏆"
      max-width="460px"
    >
      <div class="winner-body">
        <div class="winner-main">
          <img :src="winnerAvatar" class="winner-avatar" onerror="this.style.display='none'" />
          <div class="winner-info">
            <div class="winner-name">{{ winnerNick }}</div>
            <div class="winner-sound" v-if="sound">🔊 {{ sound.name }}</div>
          </div>
        </div>

        <hr class="win-sep" />

        <!-- Scores table -->
        <div class="scores-listbox">
          <div class="scores-header">
            <span>Игрок</span>
            <span>Очки</span>
          </div>
          <div
            v-for="p in scores"
            :key="p.socketId"
            class="win-list-row score-row"
            :class="{ 'win-selected': p.socketId === winnerId }"
          >
            <img :src="p.avatar" class="score-avatar" onerror="this.style.display='none'" />
            <span class="score-name">{{ p.nickname }}</span>
            <span class="score-pts">{{ p.score }} ⭐</span>
          </div>
        </div>

        <hr class="win-sep" />

        <div class="winner-actions">
          <span v-if="!isHost" class="hint-text">
            {{ isGameOver ? 'Ждём хоста...' : 'Следующий раунд через 5 сек...' }}
          </span>
          <button v-if="isHost && !isGameOver" class="win-btn win-btn-lg" @click="$emit('next-round')">
            ▶ Следующий раунд
          </button>
          <button v-if="isHost && isGameOver" class="win-btn win-btn-lg" @click="$emit('restart')">
            🔄 Сыграть снова
          </button>
        </div>
      </div>
    </WinWindow>
  </div>
</template>

<script setup>
import WinWindow from './WinWindow.vue'

defineProps({
  winnerId: String,
  winnerNick: String,
  winnerAvatar: String,
  sound: Object,
  scores: Array,
  isGameOver: Boolean,
  isHost: Boolean
})
defineEmits(['next-round', 'restart'])

function confettiStyle(i) {
  const colors = ['#1e4bcc', '#cc0000', '#008800', '#cc8800', '#7ec8ff', '#cc44cc']
  return {
    left: `${Math.random() * 100}%`,
    background: colors[i % colors.length],
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${3 + Math.random() * 3}s`,
    width: `${8 + Math.random() * 8}px`,
    height: `${8 + Math.random() * 8}px`,
    borderRadius: Math.random() > 0.5 ? '50%' : '0'
  }
}
</script>

<style scoped>
.winner-wrap { position: relative; width: 100%; }

.confetti-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}
.confetti-piece {
  position: absolute;
  top: -20px;
  animation: confettiFall linear infinite both;
}

.winner-body { display: flex; flex-direction: column; gap: 8px; }
.winner-main {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 2px solid;
  border-top-color: var(--win-dark);
  border-left-color: var(--win-dark);
  border-bottom-color: var(--win-light);
  border-right-color: var(--win-light);
  padding: 10px;
}
.winner-avatar { width: 56px; height: 56px; border-radius: 50%; border: 2px solid var(--win-dark); }
.winner-info { display: flex; flex-direction: column; gap: 4px; }
.winner-name { font-size: 18px; font-weight: bold; }
.winner-sound { font-size: 13px; color: #000080; font-family: 'Tahoma', sans-serif; }

.scores-listbox {
  border: 2px solid;
  border-top-color: var(--win-dark);
  border-left-color: var(--win-dark);
  border-bottom-color: var(--win-light);
  border-right-color: var(--win-light);
  background: white;
  max-height: 200px;
  overflow-y: auto;
}
.scores-header {
  display: flex;
  justify-content: space-between;
  padding: 3px 8px;
  background: var(--win-bg);
  font-size: 11px;
  font-weight: bold;
  border-bottom: 1px solid var(--win-dark);
  color: var(--text-muted);
  text-transform: uppercase;
}
.score-row { font-size: 13px; }
.score-avatar { width: 16px; height: 16px; border-radius: 50%; }
.score-name { flex: 1; }
.score-pts { font-weight: bold; color: #604000; }

.winner-actions { display: flex; justify-content: flex-end; align-items: center; gap: 8px; }
.hint-text { font-size: 12px; color: var(--text-muted); }
</style>
