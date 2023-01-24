<template>
  <div class="flexCol">
    <h1 v-if="auth.accountInfo">Welcome {{ auth.accountInfo.email }} !</h1>
    <h1 v-else>Sync to cloud</h1>

    <!-- HOME BUTTON -->
    <router-link to="/" class="topRightIcon">
      <img src="@/assets/home.svg" alt="">
    </router-link>

    <!-- LOGIN -->
    <section class="flexCol" v-show="loginPanel && !auth.IsConnected">
      <h2>Login</h2>
      <input type="email" placeholder="email" v-model="formValue.email">
      <input type="password" placeholder="password" v-model="formValue.password"> 
      <ButtonComponent @click="Login">Login</ButtonComponent>
      <p>Don't have an account ? <span @click="ToggleLogin()" class="underline">Sign up</span></p>
      <p v-show="feedback!=null && feedback!=''" class="text-center">{{feedback}}</p>
    </section>

    <!-- SIGN UP -->
    <section class="flexCol" v-show="!loginPanel && !auth.IsConnected">
      <h2>Sign up</h2>
      <input type="email" placeholder="email" v-model="formValue.email">
      <input type="password" placeholder="password" v-model="formValue.password">
      <input type="password" placeholder="password verification" v-model="formValue.passwordVerification">
      <ButtonComponent @click="SignUp">Create account</ButtonComponent>
      <p>Already have an account ? <span @click="ToggleLogin()" class="underline">Login</span></p>
      <p v-show="feedback!=null && feedback!=''" class="text-center">{{feedback}}</p>
    </section>

    <!-- PROFILE -->
    <section class="flexCol" v-show="auth.IsConnected">
      <h2>Account</h2>
      <p>You have {{ store.content.length }} favorites saved</p>
      <ButtonComponent @click="store.SaveContent(auth.accountInfo.$id,auth.client)">Save to cloud</ButtonComponent>
      
    </section>
    

    <section class="flexCol dangerZone">
      <h2>Danger Zone</h2>
      <p>Work in progress...</p>
      <ButtonComponent @click="Logout" classes="red">Logout</ButtonComponent>
      <!-- <button @click="auth.DeleteAccount">Delete account</button> -->
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/stores/auth'
import { useStore } from '@/stores/store'

//components
import ButtonComponent from '@/components/ButtonComponent.vue'

const auth = useAuth()
const store = useStore()
const loginPanel = ref(true)
const formValue =ref({})
const feedback = ref(null)


function ToggleLogin()
{
  loginPanel.value = ! loginPanel.value
}

async function SignUp()
{
  var form = formValue.value
  //all fields are required
  if(form.email == null || form.email == "" || form.password == null || form.password == "" || form.passwordVerification == null || form.passwordVerification == "")
  {
    feedback.value = "All fields are required"
    return
  }
  if(form.password != form.passwordVerification)
  {
    feedback.value = "Passwords don't match"
    return
  }

  feedback.value = await auth.CreateAccount(form.email,form.password)
}

function Logout()
{
  auth.Logout()
  store.ResetContent()
}


async function Login()
{
  var form = formValue.value
  //all fields are required
  if(form.email == null || form.email == "" || form.password == null || form.password == "")
  {
    feedback.value = "All fields are required"
    return
  }
  let response = await auth.Login(form.email,form.password)
  //if login success, load content from cloud
  if(response == auth.LOGIN_SUCCESS)
    store.LoadContent(auth.client)
}



</script>

<style lang="scss" scoped>

</style>