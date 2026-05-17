<template>
  <div class="sit-card">
    <div class="sit-label">📋 Ситуация</div>
    <div class="sit-body">
      <p class="sit-text">{{ situation?.text || '...' }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({ situation: Object })
</script>

<style scoped>
.sit-card {
  background: var(--win-bg);
  border: 2px solid;
  border-top-color: var(--win-light);
  border-left-color: var(--win-light);
  border-bottom-color: var(--win-dark);
  border-right-color: var(--win-dark);
}
.sit-label {
  background: linear-gradient(90deg, var(--win-title-from), var(--win-title-to));
  color: white;
  font-size: 12px;
  padding: 3px 8px;
  font-family: 'Tahoma', sans-serif;
}
.sit-body {
  padding: 12px;
  background: white;
  border: 2px solid;
  border-top-color: var(--win-dark);
  border-left-color: var(--win-dark);
  border-bottom-color: var(--win-light);
  border-right-color: var(--win-light);
  margin: 8px;
}
.sit-text {
  font-size: 15px;
  font-weight: bold;
  text-align: center;
  line-height: 1.5;
  color: var(--text);
}
</style>
