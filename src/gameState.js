import { reactive } from 'vue'

export const gameState = reactive({
  situation: null,
  hand: [],
  phase: null,
  lobbyId: null,
  myPlayer: null
})
