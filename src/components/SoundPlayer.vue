<template>
  <div
    class="sound-player"
    :class="{
      'sp-selected': selected,
      'sp-voted': voted,
      'sp-active': active,
      'sp-disabled': disabled && !active
    }"
  >
    <div class="sp-name">{{ label || sound?.name || '???' }}</div>
    <hr class="win-sep" style="margin:6px 0" />
    <div class="sp-btns">
      <button class="win-btn" @click="togglePlay" style="flex:1">
        {{ playing ? '⏸ Стоп' : '▶ Слушать' }}
      </button>
      <button
        v-if="selectable"
        class="win-btn"
        :disabled="disabled || selected"
        @click="$emit('select', soundId)"
        style="flex:1"
      >
        {{ selected ? '✓ Выбрано' : '✓ Выбрать' }}
      </button>
      <button
        v-if="votable"
        class="win-btn"
        :disabled="disabled"
        @click="$emit('vote', soundId)"
        style="flex:1"
      >
        {{ voted ? '✓ Голос' : '🗳 Голосовать' }}
      </button>
    </div>
    <audio ref="audioEl" :src="soundUrl" @ended="playing = false" preload="none" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  soundId: [String, Number],
  soundUrl: String,
  label: String,
  selectable: Boolean,
  selected: Boolean,
  votable: Boolean,
  voted: Boolean,
  disabled: Boolean,
  active: Boolean,
  sound: Object
})
defineEmits(['select', 'vote'])

const audioEl = ref(null)
const playing = ref(false)

function togglePlay() {
  if (!audioEl.value) return
  if (playing.value) {
    audioEl.value.pause()
    audioEl.value.currentTime = 0
    playing.value = false
  } else {
    audioEl.value.play().catch(() => {})
    playing.value = true
  }
}

watch(() => props.active, (v) => {
  if (v && audioEl.value) {
    audioEl.value.currentTime = 0
    audioEl.value.play().catch(() => {})
    playing.value = true
  } else if (!v && playing.value) {
    playing.value = false
  }
})

defineExpose({
  play: () => { if (audioEl.value) { audioEl.value.currentTime = 0; audioEl.value.play().catch(() => {}) } }
})
</script>

<style scoped>
.sound-player {
  background: var(--win-bg);
  border: 2px solid;
  border-top-color: var(--win-light);
  border-left-color: var(--win-light);
  border-bottom-color: var(--win-dark);
  border-right-color: var(--win-dark);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: outline 0.1s;
  cursor: default;
}
.sp-name {
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sp-btns { display: flex; gap: 4px; flex-wrap: wrap; }

.sp-selected {
  outline: 2px solid #000080;
  background: #d0e0ff;
}
.sp-voted {
  outline: 2px solid #8000cc;
}
.sp-active {
  outline: 3px solid #1e4bcc;
  animation: pulseBlue 1s infinite;
}
.sp-disabled { opacity: 0.6; }
</style>
