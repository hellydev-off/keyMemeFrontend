<template>
  <Teleport to="body">
    <div class="dlg-overlay" @mousedown.self="$emit('cancel')">
      <div class="dlg-window">
        <!-- Titlebar -->
        <div class="dlg-titlebar">
          <div class="dlg-title-left">
            <span>⚠️ Предупреждение</span>
          </div>
          <button class="win-ctrl win-ctrl-close" @click="$emit('cancel')">&#x2715;</button>
        </div>
        <!-- Body -->
        <div class="dlg-body">
          <div class="dlg-icon">⚠️</div>
          <div class="dlg-msg">{{ message }}</div>
        </div>
        <hr class="win-sep" style="margin:0 10px" />
        <div class="dlg-btns">
          <button class="win-btn" style="min-width:80px" @click="$emit('confirm')">ОК</button>
          <button class="win-btn" style="min-width:80px" @click="$emit('cancel')">Отмена</button>
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
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dlg-window {
  background: var(--win-bg);
  border: 2px solid;
  border-top-color: var(--win-light);
  border-left-color: var(--win-light);
  border-bottom-color: var(--win-dark);
  border-right-color: var(--win-dark);
  width: 340px;
  animation: fadeScaleIn 0.15s ease both;
}

.dlg-titlebar {
  background: linear-gradient(90deg, var(--win-title-from), var(--win-title-to));
  color: white;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-family: 'Tahoma', sans-serif;
  user-select: none;
}
.dlg-title-left { display: flex; align-items: center; gap: 5px; }

.win-ctrl {
  width: 18px; height: 16px;
  background: var(--win-bg);
  border: 2px solid;
  border-top-color: var(--win-light);
  border-left-color: var(--win-light);
  border-bottom-color: var(--win-dark);
  border-right-color: var(--win-dark);
  font-size: 9px; cursor: pointer; padding: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--text);
}
.win-ctrl:active { border-color: var(--win-dark) var(--win-light) var(--win-light) var(--win-dark); }
.win-ctrl-close:hover { background: #cc0000; color: white; }

.dlg-body {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
}
.dlg-icon { font-size: 32px; flex-shrink: 0; line-height: 1; }
.dlg-msg { font-size: 13px; line-height: 1.5; padding-top: 4px; }

.dlg-btns {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px 14px;
}
</style>
