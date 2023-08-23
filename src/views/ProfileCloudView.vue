<template>
  <div class="flex-col">
    <h1 v-if="auth.accountInfo">Welcome {{ auth.accountInfo.email }} !</h1>
    <h1 v-else>Sync to cloud</h1>

    <!-- HOME BUTTON -->
    <router-link to="/" class="topRightIcon">
      <img src="@/assets/home.svg" alt="">
    </router-link>

    <!-- LOGIN -->
    <section class="flex-col glass" v-show="loginPanel && !auth.IsConnected">
      <h2>Login</h2>
      <input type="email" placeholder="email" v-model="formValue.email">
      <input type="password" placeholder="password" v-model="formValue.password"> 
      <ButtonComponent @click="Login">Login</ButtonComponent>
    </section>

    <!-- PROFILE -->
    <section class="flex-col glass" v-show="auth.IsConnected">
      <h2>Account</h2>
      <p>You have {{ store.content.length }} favorites saved</p>
      <div class="flex-row">
        <p>Auto save</p>
        <CheckboxComponent @change="handleAutoSaveTrigger" :defaultValue="auth.autoSave"></CheckboxComponent>
      </div>
      <div class="flex-row">
        <p>Or save manually</p>
        <ButtonComponent @click="ManualSave">Save to cloud</ButtonComponent>
      </div>
    </section>
    

    <section class="flex-col dangerZone glass" v-show="auth.IsConnected">
      <h2>Danger Zone</h2>
      <p>Work in progress...</p>
      <ButtonComponent @click="Logout" classes="red">Logout</ButtonComponent>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/stores/auth'
import { useStore } from '@/stores/store'
import { useToast } from '@/stores/toast'
//components
import ButtonComponent from '@/components/ButtonComponent.vue'
import CheckboxComponent from '@/components/CheckboxComponent.vue'

const auth = useAuth()
const store = useStore()
const toast = useToast()

const loginPanel = ref(true)
const formValue =ref({})


async function ManualSave()
{
  let feedback = await store.SaveContent(auth.accountInfo.$id,auth.client)
  toast.Show(feedback.value,feedback.type)
}

function handleAutoSaveTrigger(value)
{
  auth.SetAutoSave(value.value)
}


function Logout()
{
  auth.Logout()
  store.ResetContent()
  toast.Show("You have been logged out","success")
}


async function Login()
{
  var form = formValue.value
  //all fields are required
  if(form.email == null || form.email == "" || form.password == null || form.password == "")
  {
    toast.Show("All fields are required","warning")
    return
  }
  let response = await auth.Login(form.email,form.password)
  toast.Show(response.value,response.type)
  //if login success, load content from cloud
  if(response.type == "success")
    store.LoadContent(auth.client)
}



</script>

<style lang="scss" scoped>

</style>