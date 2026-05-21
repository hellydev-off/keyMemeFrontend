<template>
  <div class="panel" :style="maxWidth ? { maxWidth } : {}">
    <div v-if="title" class="panel-header">
      <div class="panel-title">
        <slot name="icon">
          <span v-if="icon" class="panel-icon">{{ icon }}</span>
        </slot>
        <span>{{ title }}</span>
      </div>
      <button class="panel-close-btn" @click="$emit('close')" title="Закрыть">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div class="panel-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title:    { type: String, default: '' },
  icon:     { type: String, default: '' },
  maxWidth: { type: String, default: '500px' }
})
defineEmits(['close'])
</script>

<style scoped>
.panel {
  background: var(--c-surface);
  border-radius: var(--r);
  box-shadow: var(--shadow);
  border: 1px solid var(--c-border);
  overflow: hidden;
  animation: fadeScaleIn .2s ease both;
  width: 100%;
}
.panel-header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--c-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text);
}
.panel-icon { font-size: 18px; }
.panel-close-btn {
  width: 28px; height: 28px;
  border-radius: var(--r-full);
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-text-muted);
  transition: background .12s, color .12s;
}
.panel-close-btn:hover {
  background: var(--c-danger-bg);
  color: var(--c-danger);
}
.panel-body { padding: 20px; }
</style>
