<template>
  <Teleport to="body">
    <div class="dlg-overlay" @mousedown.self="$emit('cancel')">
      <div class="dlg-box">
        <div class="dlg-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <path d="M12 9v4M12 17h.01"/>
          </svg>
        </div>
        <p class="dlg-msg">{{ message }}</p>
        <div class="dlg-btns">
          <button class="btn btn-danger" @click="$emit('confirm')">Подтвердить</button>
          <button class="btn btn-ghost" @click="$emit('cancel')">Отмена</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({ message: { type: String, default: 'Вы уверены?' } })
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.dlg-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}
.dlg-box {
  background: var(--c-surface);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--c-border);
  padding: 28px 28px 24px;
  width: 340px;
  max-width: calc(100vw - 32px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: fadeScaleIn .18s ease both;
  text-align: center;
}
.dlg-icon-wrap {
  width: 56px; height: 56px;
  background: var(--c-warning-bg);
  border-radius: var(--r-full);
  display: flex; align-items: center; justify-content: center;
}
.dlg-msg {
  font-size: 15px;
  color: var(--c-text);
  line-height: 1.5;
}
.dlg-btns {
  display: flex;
  gap: 10px;
  width: 100%;
}
.dlg-btns .btn { flex: 1; }
</style>
