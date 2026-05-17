<template>
  <div class="player-list-wrap">
    <div class="pl-header">👥 Игроки</div>
    <div class="pl-listbox">
      <div
        v-for="p in players"
        :key="p.socketId"
        class="win-list-row pl-row"
        :class="{ 'pl-submitted': showSubmit && submittedIds?.includes(p.socketId) }"
      >
        <img :src="p.avatar" class="pl-avatar" onerror="this.style.display='none'" />
        <span class="pl-name">{{ p.nickname }}</span>
        <span v-if="p.socketId === hostSocketId" style="font-size:10px;">👑</span>
        <span v-if="showSubmit" class="pl-tick">
          {{ submittedIds?.includes(p.socketId) ? '✓' : '…' }}
        </span>
        <span v-if="showScore" class="pl-score">{{ p.score }}⭐</span>
      </div>
      <div v-if="!players?.length" class="pl-empty">—</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  players: Array,
  hostSocketId: String,
  submittedIds: Array,
  showSubmit: Boolean,
  showScore: Boolean
})
</script>

<style scoped>
.player-list-wrap { display: flex; flex-direction: column; }
.pl-header {
  background: linear-gradient(90deg, var(--win-title-from), var(--win-title-to));
  color: white;
  font-size: 12px;
  padding: 3px 8px;
  font-family: 'Tahoma', sans-serif;
}
.pl-listbox {
  border: 2px solid;
  border-top-color: var(--win-dark);
  border-left-color: var(--win-dark);
  border-bottom-color: var(--win-light);
  border-right-color: var(--win-light);
  background: white;
  overflow-y: auto;
  max-height: 300px;
  flex: 1;
}
.pl-row { font-size: 12px; }
.pl-avatar { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; }
.pl-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pl-tick { color: #000080; font-weight: bold; font-size: 12px; }
.pl-score { font-size: 11px; color: #604000; font-weight: bold; }
.pl-submitted { background: #e0f0e0; }
.pl-empty { padding: 6px 8px; color: var(--text-muted); font-size: 12px; }
</style>
