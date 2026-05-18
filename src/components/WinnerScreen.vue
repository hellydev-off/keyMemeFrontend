<template>
  <div class="winner-screen">
    <div v-if="isGameOver" class="confetti-wrap" aria-hidden="true">
      <div v-for="i in 30" :key="i" class="cp" :style="confettiStyle(i)" />
    </div>

    <p class="tc-ok title-line">{{ isGameOver ? '>> ИГРА ЗАВЕРШЕНА!' : '>> РАУНД ЗАВЕРШЁН!' }}</p>
    <div class="term-blank" />

    <div v-if="winnerId" class="winner-row">
      <span class="tc-blue">&gt;&nbsp;</span>
      <span class="tc-dim">{{ isGameOver ? 'ЧЕМПИОН: ' : 'ПОБЕДИТЕЛЬ: ' }}</span>
      <span class="tc-ok winner-name">{{ winnerNick }}</span>
    </div>
    <div v-if="sound && !isGameOver" class="sound-row">
      <span class="tc-dim">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Звук: </span>
      <span class="tc-white">{{ sound.name }}</span>
    </div>

    <div class="term-sep" />
    <p class="tc-dim">&gt; {{ isGameOver ? 'Итоговый счёт:' : 'Счёт:' }}</p>
    <div class="scores-list">
      <div
        v-for="(p, i) in sortedScores" :key="p.socketId"
        class="score-row"
        :class="{ 'score-winner': p.socketId === winnerId }"
      >
        <span class="tc-dim">{{ String(i + 1).padStart(2, '0') }}&nbsp;|&nbsp;</span>
        <span class="score-nick tc-white">{{ p.nickname }}</span>
        <span class="tc-dim">&nbsp;|&nbsp;</span>
        <span class="tc-ok">{{ '★'.repeat(p.score) }}{{ '☆'.repeat(Math.max(0, 3 - p.score)) }}</span>
      </div>
    </div>

    <div class="term-sep" />
    <div v-if="isHost">
      <button v-if="!isGameOver" class="term-btn term-btn-primary" @click="$emit('next-round')">
        [ ▶  СЛЕДУЮЩИЙ РАУНД ]
      </button>
      <button v-else class="term-btn term-btn-primary" @click="$emit('restart')">
        [ 🔄  СЫГРАТЬ СНОВА ]
      </button>
    </div>
    <p v-else class="tc-dim">&gt; Ждём хоста...</p>
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

function confettiStyle(i) {
  const colors = ['#4ec9b0', '#569cd6', '#dcdcaa', '#f44747', '#4ec9b0']
  return {
    left: `${(i * 37 + 7) % 100}%`,
    background: colors[i % colors.length],
    animationDelay: `${(i * 0.23) % 3}s`,
    animationDuration: `${3 + (i * 0.17) % 2}s`,
    width:  `${8 + (i % 5)}px`,
    height: `${8 + (i % 5)}px`,
    borderRadius: i % 2 === 0 ? '50%' : '0'
  }
}
</script>

<style scoped>
.winner-screen { display: flex; flex-direction: column; gap: 4px; font-family: 'Courier New', monospace; }
.tc-dim   { color: #555; }
.tc-white { color: #ccc; }
.tc-blue  { color: #569cd6; }
.tc-ok    { color: #4ec9b0; }
.term-blank { height: 0.4em; }
.term-sep { border: none; border-top: 1px solid #222; margin: 6px 0; }

.title-line { font-size: 14px; }
.winner-row { display: flex; align-items: baseline; font-size: 14px; }
.winner-name { font-size: 16px; font-weight: bold; }
.sound-row { font-size: 13px; }

.scores-list { display: flex; flex-direction: column; gap: 2px; }
.score-row { display: flex; align-items: baseline; font-size: 13px; }
.score-nick { min-width: 100px; }
.score-winner .score-nick { color: #4ec9b0; }

.term-btn {
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #888;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}
.term-btn:hover { background: #1a1a1a; border-color: #569cd6; color: #fff; }
.term-btn-primary { border-color: #4ec9b0; color: #4ec9b0; }
.term-btn-primary:hover { background: #0a2020; color: #7fffdf; }

.confetti-wrap {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}
.cp {
  position: absolute;
  top: -20px;
  animation: confettiFall linear infinite both;
}
@keyframes confettiFall {
  0%   { transform: translateY(-20px) rotate(0deg);  opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
</style>
