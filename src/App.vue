<template>
  <!-- BACKGROUND -->
  <img src="@/assets/circle-scatter-haikei.svg" alt="bg" class="background">
  <router-view></router-view>
  <ToastComponent/>
</template>

<script setup>
import { useAuth } from '@/stores/auth'
import { useStore } from '@/stores/store'
import { useToast } from '@/stores/toast'
//toast component
import ToastComponent from '@/components/ToastComponent.vue'

const toast = useToast()
const auth = useAuth()
const store = useStore()

store.toast = toast


auth.SetupClient()
auth.CheckConnection()

store.LoadContent(auth.client)


//every 10s check if the content as been updated locally. If so, save to server
setInterval(() => {
  if(store.UnsavedChanges() && auth.IsConnected)
  {
    store.SaveContent(auth.accountInfo.$id,auth.client)
  }
}, 5*1000)

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
