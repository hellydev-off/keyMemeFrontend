<template>
  <div class="ws-wrap">

    <!-- Confetti (game over only) -->
    <div v-if="isGameOver" class="confetti-wrap" aria-hidden="true">
      <div v-for="i in 40" :key="i" class="cp" :style="confettiStyle(i)" />
    </div>

    <!-- Header badge -->
    <div class="ws-header">
      <div class="ws-badge" :class="isGameOver ? 'badge-gold' : 'badge-indigo'">
        <svg v-if="isGameOver" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
        </svg>
        <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>
      <div>
        <div class="ws-title">{{ isGameOver ? 'Игра завершена!' : 'Раунд завершён!' }}</div>
        <div class="ws-sub">{{ isGameOver ? 'Итоговые результаты' : 'Результаты раунда' }}</div>
      </div>
    </div>

    <!-- Winner card -->
    <div v-if="winnerId" class="winner-card" :class="isGameOver ? 'winner-gold' : 'winner-indigo'">
      <div class="winner-avatar">{{ winnerNick?.charAt(0).toUpperCase() }}</div>
      <div class="winner-info">
        <div class="winner-label">{{ isGameOver ? 'Чемпион' : 'Победитель раунда' }}</div>
        <div class="winner-name">{{ winnerNick }}</div>
        <div v-if="sound && !isGameOver" class="winner-sound">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          {{ sound.name }}
        </div>
      </div>
    </div>

    <!-- Scores -->
    <div class="scores-section">
      <div class="scores-title">{{ isGameOver ? 'Итоговый счёт' : 'Счёт' }}</div>
      <div class="scores-list">
        <div
          v-for="(p, i) in sortedScores" :key="p.socketId"
          class="score-row"
          :class="{ 'is-winner': p.socketId === winnerId }"
        >
          <span class="score-rank">{{ i + 1 }}</span>
          <div class="score-avatar" :style="avatarStyle(p.nickname)">
            {{ p.nickname?.charAt(0).toUpperCase() }}
          </div>
          <span class="score-nick">{{ p.nickname }}</span>
          <div class="score-stars">
            <svg
              v-for="s in 3" :key="s"
              width="16" height="16" viewBox="0 0 24 24"
              :fill="s <= p.score ? '#f59e0b' : 'none'"
              stroke="#f59e0b"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
            </svg>
          </div>
          <span class="score-pts">{{ p.score }} {{ scorePtsLabel(p.score) }}</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="ws-actions">
      <template v-if="isHost">
        <button v-if="!isGameOver" class="btn btn-primary ws-btn" @click="$emit('next-round')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          Следующий раунд
        </button>
        <button v-else class="btn btn-primary ws-btn" @click="$emit('restart')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Сыграть снова
        </button>
      </template>
      <div v-else class="waiting-host">
        <div class="waiting-dot" />
        Ждём хоста…
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  winnerId:   String,
  winnerNick: String,
  sound:      Object,
  scores:     Array,
  isGameOver: Boolean,
  isHost:     Boolean
})
defineEmits(['next-round', 'restart'])

const sortedScores = computed(() =>
  [...(props.scores || [])].sort((a, b) => b.score - a.score)
)

const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f59e0b',
  '#10b981','#0ea5e9','#f97316','#14b8a6'
]
function avatarStyle(nick) {
  const idx = (nick?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length
  return { background: AVATAR_COLORS[idx] }
}

function scorePtsLabel(n) {
  if (n === 1) return 'очко'
  if (n >= 2 && n <= 4) return 'очка'
  return 'очков'
}

function confettiStyle(i) {
  const colors = ['#6366f1','#8b5cf6','#f59e0b','#ec4899','#10b981','#0ea5e9','#f97316']
  return {
    left: `${(i * 37 + 7) % 100}%`,
    background: colors[i % colors.length],
    animationDelay: `${(i * 0.19) % 3}s`,
    animationDuration: `${2.8 + (i * 0.15) % 2}s`,
    width:  `${7 + (i % 6)}px`,
    height: `${7 + (i % 6)}px`,
    borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0'
  }
}
</script>

<style scoped>
.ws-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0;
}

/* Header */
.ws-header {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ws-badge {
  width: 48px; height: 48px;
  border-radius: var(--r);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.badge-gold   { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
.badge-indigo { background: linear-gradient(135deg, var(--c-primary), var(--c-violet)); color: white; }
.ws-title { font-size: 17px; font-weight: 700; color: var(--c-text); }
.ws-sub   { font-size: 12px; color: var(--c-text-muted); margin-top: 2px; }

/* Winner card */
.winner-card {
  border-radius: var(--r);
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.winner-gold   { background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1.5px solid #fcd34d; }
.winner-indigo { background: var(--c-primary-light); border: 1.5px solid var(--c-primary-mid); }
.winner-avatar {
  width: 52px; height: 52px;
  border-radius: var(--r-full);
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 22px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(245,158,11,.4);
}
.winner-indigo .winner-avatar { background: linear-gradient(135deg, var(--c-primary), var(--c-violet)); box-shadow: 0 2px 8px rgba(99,102,241,.3); }
.winner-label { font-size: 11px; font-weight: 600; color: var(--c-text-muted); text-transform: uppercase; letter-spacing: .05em; }
.winner-name  { font-size: 20px; font-weight: 800; color: var(--c-text); margin-top: 2px; }
.winner-sound {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--c-text-muted); margin-top: 4px;
}

/* Scores */
.scores-section { display: flex; flex-direction: column; gap: 8px; }
.scores-title {
  font-size: 11px; font-weight: 600; color: var(--c-text-light);
  text-transform: uppercase; letter-spacing: .05em;
}
.scores-list { display: flex; flex-direction: column; gap: 4px; }
.score-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--r-sm);
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  transition: border-color .12s;
}
.score-row.is-winner {
  border-color: var(--c-primary-mid);
  background: var(--c-primary-light);
}
.score-rank {
  font-size: 12px; font-weight: 700; color: var(--c-text-light);
  min-width: 16px; text-align: center;
}
.score-avatar {
  width: 28px; height: 28px;
  border-radius: var(--r-full);
  color: white; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.score-nick {
  flex: 1;
  font-size: 14px; font-weight: 600; color: var(--c-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.score-row.is-winner .score-nick { color: var(--c-primary); }
.score-stars { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
.score-pts {
  font-size: 12px; color: var(--c-text-muted);
  white-space: nowrap; flex-shrink: 0;
}

/* Actions */
.ws-actions { display: flex; justify-content: flex-end; }
.ws-btn {
  display: flex; align-items: center; gap: 7px;
  font-size: 14px; font-weight: 600;
  padding: 10px 20px;
}
.waiting-host {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--c-text-muted);
}
.waiting-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--c-primary);
  animation: pulse 1.4s ease-in-out infinite;
}

/* Confetti */
.confetti-wrap {
  position: fixed; inset: 0;
  pointer-events: none; z-index: 100;
  overflow: hidden;
}
.cp {
  position: absolute; top: -20px;
  animation: confettiFall linear infinite both;
}
@keyframes confettiFall {
  0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg);  opacity: 0; }
}
</style>
