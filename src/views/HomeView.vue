<template>
  <div class="home">
    <img src="@/assets/waves.svg" alt="bg" class="animatedWaves">
    <input type="url" name="search" v-model="searchQuery" placeholder="Search" ref="searchBar">
    <div v-if="results!={}" class="results">
      <ResultCardVue v-for="(res, index) in results" :key="index" :result="res.item" :score="res.score"></ResultCardVue>
    </div>
  </div>
</template>

<script setup>
import { ref,watch } from 'vue'
import { useStore } from '@/stores/store'
import ResultCardVue from '@/components/ResultCard.vue'

import { cleanUpJSON } from '@/js/convertTabsAsJson';
import json from '@/js/tools.json'

let converted = cleanUpJSON(json)
console.log(converted)

const store = useStore()
store.LoadContent()

var searchQuery = ref('')
var results = ref({})
var searchBar = ref(null)

function emptySearch()
{
  results.value = {}
  searchBar.value.classList.remove('activeSearch')
}

//when search is changed, call search function
watch(searchQuery, (value) => {
  if(value.length==0 || value==undefined)
  {
    emptySearch()
    return
  }

  //wait .3s before searching
  console.log("searching", value)
  searchBar.value.classList.add('activeSearch')
  setTimeout(() => {
    if(searchQuery.value!=0){
      results.value = store.search(value)
    }
  }, 300);
  
})
</script>

<style lang="scss" scoped>
.animatedWaves{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: -1;
}
.home{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  height: 100%;
  min-height: 90vh;
  input{
    position:absolute;
    top:40%;
    left:calc(50% - min(500px, 100%)/2);
    width: 100%;
    max-width: 500px;
    height: 50px;
    font-size: 2rem;
    border-radius: 1rem;
    outline: none;
    border: none;
    padding: 0 1rem;
    background-color: $white;


    transition: all 0.3s ease-in-out;
    &.activeSearch{
      top:0;
      left:0;
      transform: scale(0.5) translate(-45%, 0%);
    }
  }

  .results{
    display:grid;
    //max 3 columns
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    width: 90%;
    gap: 1rem;
    transform: translate(0rem, 50px);
    padding-bottom: 1rem;
  }
}
</style>
