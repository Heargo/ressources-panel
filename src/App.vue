<template>
  <!-- BACKGROUND -->
  <img src="@/assets/circle-scatter-haikei.svg" alt="bg" class="background">
  <router-view/>
</template>

<script setup>
import { useAuth } from '@/stores/auth'
import { useStore } from '@/stores/store'

const auth = useAuth()
const store = useStore()

auth.SetupClient()
auth.CheckConnection()

store.LoadContent(auth.client)

</script>


<style lang="scss">
.background{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
  object-fit: cover;
  background-position: center
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $text-color;
}
</style>
