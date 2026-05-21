<template>
  <div class="app-bg" aria-hidden="true">
    <svg class="bg-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stop-color="#ede9fe"/>
          <stop offset="40%"  stop-color="#e0e7ff"/>
          <stop offset="100%" stop-color="#fdf2f8"/>
        </linearGradient>
        <radialGradient id="glow1" cx="20%" cy="30%" r="45%">
          <stop offset="0%"   stop-color="rgba(99,102,241,.18)"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
        <radialGradient id="glow2" cx="80%" cy="70%" r="45%">
          <stop offset="0%"   stop-color="rgba(168,139,250,.15)"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
        <radialGradient id="glow3" cx="50%" cy="10%" r="35%">
          <stop offset="0%"   stop-color="rgba(236,72,153,.10)"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>

      <!-- Base gradient -->
      <rect width="1200" height="800" fill="url(#bgGrad)"/>

      <!-- Glow blobs -->
      <rect width="1200" height="800" fill="url(#glow1)"/>
      <rect width="1200" height="800" fill="url(#glow2)"/>
      <rect width="1200" height="800" fill="url(#glow3)"/>

      <!-- Decorative blurred circles -->
      <circle cx="150"  cy="180" r="120" fill="rgba(99,102,241,.07)"  class="blob"/>
      <circle cx="1050" cy="600" r="160" fill="rgba(124,58,237,.07)"  class="blob"/>
      <circle cx="600"  cy="750" r="100" fill="rgba(236,72,153,.06)"  class="blob"/>
      <circle cx="980"  cy="120" r="90"  fill="rgba(99,102,241,.06)"  class="blob"/>
      <circle cx="220"  cy="620" r="80"  fill="rgba(167,139,250,.07)" class="blob"/>

      <!-- Grid dots pattern -->
      <g opacity=".35">
        <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(99,102,241,.3)"/>
        </pattern>
        <rect width="1200" height="800" fill="url(#dots)"/>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.app-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.bg-svg {
  width: 100%;
  height: 100%;
  display: block;
}
.blob {
  filter: blur(40px);
}
</style>
