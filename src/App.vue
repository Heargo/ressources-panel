<template>
  <!-- BACKGROUND -->
  <img src="@/assets/circle-scatter-haikei.svg" alt="bg" class="animatedWaves">
  <router-view/>
</template>

<script setup>
import { useAuth } from '@/stores/auth'
import { useStore } from '@/stores/store'

const auth = useAuth()
const store = useStore()

auth.SetupClient()
auth.CheckConnection()

store.LoadContent(auth.client, auth.account)

</script>


<style lang="scss">
.animatedWaves{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: -1;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $text-color;
}
</style>
