<template>
  <div class="gbg" aria-hidden="true">
    <!-- Circuit grid fills whole bg -->
    <div class="gbg-circuit" />

    <!-- Scanline overlay -->
    <div class="gbg-scanlines" />

    <!-- Binary columns -->
    <div class="bin-col bin-col-1">{{ binText }}</div>
    <div class="bin-col bin-col-2">{{ binText2 }}</div>

    <!-- cd.png — bottom-left, rainbow spin + glow -->
    <img src="/mainPage/cd.png" class="gbg-obj gbg-cd" />

    <!-- cassette.png — top-left, dramatic wobble + purple glow -->
    <img src="/mainPage/cassette.png" class="gbg-obj gbg-cassette" />

    <!-- gameboy.png — right side, bounce + green flicker -->
    <img src="/mainPage/gameboy.png" class="gbg-obj gbg-gameboy" />

    <!-- imac.png — bottom-right, float + cyan glow + terminal -->
    <div class="gbg-pc-wrap">
      <img src="/mainPage/imac.png" class="gbg-imac-img" />
      <div class="gbg-terminal">
        <span class="gbg-t-line">C:\KEYMEME&gt; _</span>
        <span class="gbg-t-line gbg-t-ready">KEYMEME READY.</span>
        <span class="gbg-cursor">█</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const row = () => Array.from({ length: 36 }, () => Math.round(Math.random())).join(' ')
const binText  = Array.from({ length: 80 }, row).join('\n')
const binText2 = Array.from({ length: 80 }, row).join('\n')
</script>

<style scoped>
/* ─── Base layer ─── */
.gbg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: #0a0f2e;
}

.gbg-circuit {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, #1a2a6e 1px, transparent 1px),
    linear-gradient(rgba(30,75,204,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30,75,204,0.04) 1px, transparent 1px);
  background-size: 28px 28px, 56px 56px, 56px 56px;
}

.gbg-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0,0,20,0.12) 3px,
    rgba(0,0,20,0.12) 4px
  );
  pointer-events: none;
}

/* ─── Binary rain ─── */
.bin-col {
  position: absolute;
  top: 0;
  font-family: monospace;
  font-size: 11px;
  color: #1e4bcc;
  opacity: 0.25;
  white-space: pre;
  line-height: 1.55;
  animation: binScroll 18s linear infinite;
  user-select: none;
}
.bin-col-1 { left: 6px;  animation-delay: 0s; }
.bin-col-2 { left: 80px; animation-delay: -9s; }

@keyframes binScroll {
  from { transform: translateY(-50%); }
  to   { transform: translateY(0%); }
}

/* ─── Shared ─── */
.gbg-obj {
  position: absolute;
  user-select: none;
}

/* ═══════════════════════════════
   CD  —  rainbow spin, big glow
   ═══════════════════════════════ */
.gbg-cd {
  width: 260px;
  bottom: 30px;
  left: 180px;
  transform-origin: center;
  animation: cdSpin 7s linear infinite, cdGlow 3.5s ease-in-out infinite alternate;
}
@keyframes cdSpin {
  0%   { transform: rotate(0deg)   scale(1);    filter: hue-rotate(0deg)   drop-shadow(0 0 18px rgba(255,80,80,0.8)); }
  25%  {                                         filter: hue-rotate(90deg)  drop-shadow(0 0 28px rgba(80,255,80,0.9)); }
  50%  { transform: rotate(180deg) scale(1.04); filter: hue-rotate(180deg) drop-shadow(0 0 36px rgba(80,80,255,1));   }
  75%  {                                         filter: hue-rotate(270deg) drop-shadow(0 0 28px rgba(255,80,255,0.9)); }
  100% { transform: rotate(360deg) scale(1);    filter: hue-rotate(360deg) drop-shadow(0 0 18px rgba(255,80,80,0.8)); }
}
@keyframes cdGlow {
  from { opacity: 0.8; }
  to   { opacity: 1; }
}

/* ═══════════════════════════════
   CASSETTE  —  wobble, purple
   ═══════════════════════════════ */
.gbg-cassette {
  width: 300px;
  top: 120px;
  left: -20px;
  animation: cassetteWobble 4s ease-in-out infinite;
}
@keyframes cassetteWobble {
  0%   { transform: rotate(-7deg) translateY(0);    filter: drop-shadow(0 0 10px rgba(160,60,255,0.5)); }
  20%  { transform: rotate(7deg)  translateY(-12px); filter: drop-shadow(0 0 26px rgba(200,80,255,1)); }
  40%  { transform: rotate(-5deg) translateY(-6px);  filter: drop-shadow(0 0 14px rgba(160,60,255,0.6)); }
  60%  { transform: rotate(6deg)  translateY(-16px); filter: drop-shadow(0 0 32px rgba(255,100,255,1)); }
  80%  { transform: rotate(-4deg) translateY(-8px);  filter: drop-shadow(0 0 18px rgba(160,60,255,0.7)); }
  100% { transform: rotate(-7deg) translateY(0);    filter: drop-shadow(0 0 10px rgba(160,60,255,0.5)); }
}

/* ═══════════════════════════════
   GAMEBOY  —  bounce, green
   ═══════════════════════════════ */
.gbg-gameboy {
  width: 170px;
  top: 50%;
  right: 10px;
  transform-origin: center bottom;
  animation: gameboyBounce 3.5s cubic-bezier(.36,.07,.19,.97) infinite;
}
@keyframes gameboyBounce {
  0%   { transform: translateY(-50%) rotate(-3deg) scale(1);    filter: drop-shadow(0 0 10px rgba(60,255,120,0.5)); }
  20%  { transform: translateY(calc(-50% - 24px)) rotate(4deg) scale(1.06); filter: drop-shadow(0 0 30px rgba(60,255,120,1)); }
  35%  { transform: translateY(calc(-50% - 12px)) rotate(-2deg) scale(1.03); filter: drop-shadow(0 0 16px rgba(60,255,120,0.7)); }
  50%  { transform: translateY(calc(-50% - 28px)) rotate(5deg) scale(1.08); filter: drop-shadow(0 0 36px rgba(60,255,180,1)); }
  70%  { transform: translateY(calc(-50% - 8px)) rotate(-1deg)  scale(1.02); filter: drop-shadow(0 0 12px rgba(60,255,120,0.5)); }
  100% { transform: translateY(-50%) rotate(-3deg) scale(1);    filter: drop-shadow(0 0 10px rgba(60,255,120,0.5)); }
}

/* ═══════════════════════════════
   iMAC  —  float, cyan glow
   ═══════════════════════════════ */
.gbg-pc-wrap {
  position: absolute;
  bottom: 20px;
  right: 200px;
  width: 280px;
  animation: imacFloat 5s ease-in-out infinite alternate;
}
.gbg-imac-img {
  width: 280px;
  display: block;
  filter: drop-shadow(0 0 16px rgba(80,180,255,0.6));
}
@keyframes imacFloat {
  from { transform: translateY(0);    filter: drop-shadow(0 0 14px rgba(80,180,255,0.5)); }
  to   { transform: translateY(-20px); filter: drop-shadow(0 0 34px rgba(80,220,255,0.95)); }
}

.gbg-terminal {
  position: absolute;
  top: 20%;
  left: 16%;
  right: 14%;
  display: flex;
  flex-direction: column;
  gap: 1px;
  font-family: 'Courier New', monospace;
  font-size: 8.5px;
  color: #39ff14;
  text-shadow: 0 0 6px #39ff14, 0 0 12px #39ff14;
  overflow: hidden;
  pointer-events: none;
}
.gbg-t-line { white-space: nowrap; animation: termTypein 0.5s steps(18) both; }
.gbg-t-ready { animation-delay: 0.6s; opacity: 0; animation-fill-mode: both; }
.gbg-cursor  { animation: gbgBlink 0.7s step-end infinite; font-size: 9px; }

@keyframes termTypein {
  from { width: 0; opacity: 0; }
  to   { width: 100%; opacity: 1; }
}
@keyframes gbgBlink {
  0%, 100% { opacity: 1; } 50% { opacity: 0; }
}

/* ─── Responsive ─── */
@media (max-width: 1100px) {
  .gbg-cassette { width: 220px; }
  .gbg-cd { width: 200px; left: 160px; }
  .gbg-pc-wrap { width: 220px; right: 170px; }
  .gbg-imac-img { width: 220px; }
  .gbg-gameboy { width: 130px; }
}
@media (max-width: 900px) {
  .gbg-cassette, .gbg-gameboy { display: none; }
  .gbg-cd { width: 150px; left: 8px; }
  .gbg-pc-wrap { right: 8px; width: 170px; }
  .gbg-imac-img { width: 170px; }
}
@media (max-width: 600px) {
  .gbg-cd, .gbg-pc-wrap { display: none; }
  .bin-col { display: none; }
}
</style>
