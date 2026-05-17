<template>
  <div class="timer-wrap" :class="{ 'timer-urgent': remaining <= 10 }">
    <svg :width="size" :height="size" class="timer-svg">
      <circle :cx="c" :cy="c" :r="r" fill="none" stroke="#bdb8b0" :stroke-width="sw"/>
      <circle :cx="c" :cy="c" :r="r" fill="none"
        :stroke="trackColor" :stroke-width="sw"
        stroke-linecap="butt"
        :stroke-dasharray="circ"
        :stroke-dashoffset="offset"
        transform="rotate(-90 50 50)"
      />
    </svg>
    <div class="timer-text">
      <span class="timer-num">{{ remaining }}</span>
      <span class="timer-sec">сек</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  duration: { type: Number, required: true },
  running: { type: Boolean, default: true }
})
const emit = defineEmits(['done'])

const size = 90; const sw = 7; const c = size / 2; const r = c - sw
const circ = 2 * Math.PI * r

const remaining = ref(props.duration)
let interval = null

const offset = computed(() => circ * (1 - remaining.value / props.duration))
const trackColor = computed(() => remaining.value <= 10 ? '#cc0000' : remaining.value <= 30 ? '#cc6600' : '#000080')

function start() {
  clearInterval(interval)
  remaining.value = props.duration
  interval = setInterval(() => {
    if (remaining.value <= 0) { clearInterval(interval); emit('done'); return }
    remaining.value--
  }, 1000)
}

watch(() => props.running, v => { if (v) start(); else clearInterval(interval) }, { immediate: true })
watch(() => props.duration, () => { if (props.running) start() })
onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.timer-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--win-bg);
  border: 2px solid;
  border-top-color: var(--win-dark);
  border-left-color: var(--win-dark);
  border-bottom-color: var(--win-light);
  border-right-color: var(--win-light);
  padding: 4px;
}
.timer-svg { display: block; }
.timer-text {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}
.timer-num { font-size: 1.3rem; font-weight: bold; font-family: 'Courier New', monospace; color: #000080; }
.timer-sec { font-size: 9px; color: var(--text-muted); text-transform: uppercase; }
.timer-urgent .timer-num { color: #cc0000; }
.timer-urgent { animation: none; outline: 2px solid #cc0000; }
</style>
