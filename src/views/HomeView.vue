<template>
  <div class="home">
    <router-link to="/settings" class="topRightIcon">
      <img src="@/assets/settings.svg" alt="">
    </router-link>

    <!-- SEARCH BAR -->
    <section class="searchBarContainer" ref="searchBar">
      <input type="text" name="search" v-model="searchQuery" placeholder="Search" @keypress.enter="search">
      <img src="@/assets/search.svg" alt="" @click="search">
    </section>
    
    <!-- MOST VISITED v-if="(infos=='' && searchQuery.length ==0 )" -->
    <section  class="mostVisited" ref="mostVisited">
      <div class="favDisplayFlex col">
        <FavCardVue v-for="(res, index) in store.GetMostVisited(10)" :key="index" :result="res"></FavCardVue>
      </div>
    </section>
    
    <!-- RESULTS -->
    <section v-if="(infos!='')" class="results">
      <p v-if="(results.length==0)" class="infos">{{infos}}</p>
      <div class="favDisplayFlex">
        <ResultCardVue v-for="(res, index) in results" :key="index" :result="res.item" :score="res.score"></ResultCardVue>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from '@/stores/store'
import ResultCardVue from '@/components/ResultCard.vue'
import FavCardVue from '@/components/FavCard.vue'
import { cleanUpJSON } from '@/js/convertTabsAsJson'
import json from '@/js/tools.json'

let c = cleanUpJSON(json)
console.log(c)

const store = useStore()
store.LoadContent()

var searchQuery = ref('')
var results = ref([])
var infos = ref("")

var mostVisited = ref(null)
var searchBar = ref(null)


function emptySearch()
{
  results.value = []
  infos.value = ""
  searchBar.value.classList.remove('activeSearch')
  mostVisited.value.classList.remove('activeSearch')
}
//eslint-disable-next-line
function search()
{
  if(searchQuery.value.length==0 || searchQuery.value==undefined)
  {
    emptySearch()
    return
  }

  //wait .3s before searching
  console.log("searching", searchQuery.value)
  searchBar.value.classList.add('activeSearch')
  mostVisited.value.classList.add('activeSearch')
  setTimeout(() => {
    if(searchQuery.value!=0){
      let data = store.search(searchQuery.value)
      results.value = data.results
      infos.value = data.infos
    }
  }, 300);
}
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

  .topRightIcon{
    &:hover{
        transform-origin: center;
        transform:rotate(180deg);
    }
}
  .searchBarContainer{
    position:absolute;
    top:40%;
    left:calc(50% - min(550px, 100%)/2);
    width: 100%;
    max-width: 550px;
    transition: all 0.3s ease-in-out;
    z-index: 10;
    
    input{
      width: calc(100% - 2rem);
      height: 50px;
      font-size: 2rem;
      border-radius: 1rem;
      outline: none;
      border: none;
      padding: 0 1rem;
      background-color: $white;
    }

    img{
      position: absolute;
      top: 50%;
      right: 1rem;
      transform: translate(0, -50%);
      width: 30px;
      height: 30px;
      cursor: pointer;
    }


    &.activeSearch{
      position: fixed;
      top:0;
      left:0;
      transform: scale(0.5) translate(-45%, 0%);
    }
  }

  .infos{
    font-size: 1.5rem;
    color: $dark;
    margin-top: 1rem;
  }
  
  .favDisplayFlex{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
    gap: 1rem;

    &.col{
      flex-direction: column;
      width: fit-content;
    }
  }

  .mostVisited{
    width: fit-content;
    position: fixed;
    top: 1rem;
    left: 1rem;
    height: calc(100% - 1rem);
    transition: all 0.3s ease-in-out;
    &.activeSearch{
      top: 3rem;
    }
  }

  .results{
    transform: translate(0rem, 50px);
    padding-bottom: 1rem;
  }

}
</style>
