<template>
  <div class="settings">
    <h1 v-if="auth.accountInfo">Welcome {{ auth.accountInfo.email }}</h1>
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
      <button @click="Login">Login</button>
      <p>Don't have an account ? <span @click="ToggleLogin()" class="underline">Sign up</span></p>
      <p v-show="feedback!=null && feedback!=''" class="feedback">{{feedback}}</p>
    </section>

    <!-- SIGN UP -->
    <section class="flexCol" v-show="!loginPanel && !auth.IsConnected">
      <h2>Sign up</h2>
      <input type="email" placeholder="email" v-model="formValue.email">
      <input type="password" placeholder="password" v-model="formValue.password">
      <input type="password" placeholder="password verification" v-model="formValue.passwordVerification">
      <button @click="SignUp">Create account</button>
      <p>Already have an account ? <span @click="ToggleLogin()" class="underline">Login</span></p>
      <p v-show="feedback!=null && feedback!=''" class="feedback">{{feedback}}</p>
    </section>

    <!-- PROFILE -->
    <section class="flexCol" v-show="auth.IsConnected">
      <h2>Account</h2>
      <p>You have {{ 10 }} favorites saved</p>
      <button @click="store.SaveContent(auth.accountInfo.$id,auth.client)">Save to cloud</button>
      <button @click="store.ListFiles(auth.client)">List all files</button>
      <button @click="Logout">Logout</button>
    </section>
    

    <section class="flexCol dangerZone">
      <h2>Danger Zone</h2>
      <button @click="auth.DeleteAccount">Delete account</button>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/stores/auth'
import { useStore } from '@/stores/store'

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
    store.LoadContent(auth.client, auth.account)
}



</script>

<style lang="scss" scoped>



section{
  margin-top: 2rem;
  width: fit-content;
  background-color: $background-alternative;
  width: 80%;
  max-width: 650px;
  border-radius: 30px;
  padding: 1rem;
  input{
    border: none;
    border-radius: 1rem;
    padding: .5rem .8rem;
    font-size: 1rem;
    outline: none;
    border: 0;
    background-color: $background-alternative2;
    color: $text-color;
  }

  &.dangerZone{
    h2{
      color: $red;
      font-weight: bold;
      &::after, &::before{
        background-color: $red;
      }
    }
    button{
      background-color: $white;
      color: $red;
      font-weight: bold;
      &:hover{
        background-color: $red;
        color: $white;
      }
    }
  }
  
  h2{
    position: relative;
    $line-size:200px;
    padding: 0;
    margin: 0;

    &::after, &::before{
      content: "";
      position: absolute;
      top:1rem;
      right: -$line-size;
      display: block;
      width: $line-size;
      height: 2px;
      background-color: $secondary;
      margin: 0 -1rem;
    }
    &::before{
      right: 0;
      left:-$line-size;
      margin: 0 -1rem;
    }
  }
}

.feedback{
  text-align: center;
}

.settings{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

button{
  border: none;
  border-radius: 1rem;
  padding: .5rem .8rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: $button;
  color: $button-txt;
  filter:brightness(.9);
  &:hover{
    transform: scale(1.05);
    //make the all button darker (filter)
    filter:brightness(1.1)
  }
  &.bigger{
    font-size: 1.5rem;
    padding: .2rem 1rem;
  }
}

.flexCol{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  .inline{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
}


</style>