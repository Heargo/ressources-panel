<template>
  <!-- BACKGROUND -->
  <img src="@/assets/waves.svg" alt="bg" class="animatedWaves">

  <router-view/>
</template>

<style>
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
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
