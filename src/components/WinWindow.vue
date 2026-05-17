<template>
  <div class="win-window" :style="maxWidth ? { maxWidth } : {}">
    <div class="win-titlebar">
      <div class="win-titlebar-left">
        <span class="win-title-icon" v-if="icon">{{ icon }}</span>
        <span class="win-title-text">{{ title }}</span>
      </div>
      <div class="win-title-btns">
        <button class="win-ctrl" title="Свернуть">&#x2014;</button>
        <button class="win-ctrl" title="Развернуть">&#x25A1;</button>
        <button class="win-ctrl win-ctrl-close" title="Закрыть" @click="$emit('close')">&#x2715;</button>
      </div>
    </div>
    <div class="win-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Без названия' },
  icon:  { type: String, default: '' },
  maxWidth: { type: String, default: '500px' }
})
defineEmits(['close'])
</script>

<style scoped>
.win-window {
  background: var(--win-bg);
  border: 2px solid;
  border-top-color: var(--win-light);
  border-left-color: var(--win-light);
  border-bottom-color: var(--win-dark);
  border-right-color: var(--win-dark);
  width: 100%;
  animation: fadeScaleIn 0.2s ease both;
  position: relative;
}

.win-titlebar {
  background: linear-gradient(90deg, var(--win-title-from), var(--win-title-to));
  color: var(--win-title-text);
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  user-select: none;
}

.win-titlebar-left {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-family: 'Tahoma', sans-serif;
  font-weight: normal;
  overflow: hidden;
}

.win-title-icon { font-size: 14px; flex-shrink: 0; }
.win-title-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.win-title-btns { display: flex; gap: 2px; flex-shrink: 0; }

.win-ctrl {
  width: 18px;
  height: 16px;
  background: var(--win-bg);
  border: 2px solid;
  border-top-color: var(--win-light);
  border-left-color: var(--win-light);
  border-bottom-color: var(--win-dark);
  border-right-color: var(--win-dark);
  font-size: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  padding: 0;
  line-height: 1;
}
.win-ctrl:active {
  border-top-color: var(--win-dark);
  border-left-color: var(--win-dark);
  border-bottom-color: var(--win-light);
  border-right-color: var(--win-light);
}
.win-ctrl-close:hover { background: #cc0000; color: white; }

.win-body {
  padding: 12px;
  background: var(--win-bg);
}
</style>
