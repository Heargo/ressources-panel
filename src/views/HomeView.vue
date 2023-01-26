<template>
  <div class="home flexCol">
    <div class="topRightIcon">
      <svg @click="store.toggleEditMode()"
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-3 -3 30 30" stroke-width="1.5" stroke="black" :class="{'scale':true,'active':store.editMode}">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
      </svg>
      <img :src="require(`@/assets/cloud${auth.IsConnected ? auth.autoSave ? '-autosave' : '' : '-offline'}-outline.svg`)" @click="$router.push('/profile')">
      <img src="@/assets/settings.svg" @click="$router.push('/settings')" class="rotate">
    </div>

    <!-- SEARCH BAR -->
    <div class="searchBarContainer" ref="searchBar">
      <div class="inline" style="margin-top:0;">
        <input type="text" name="search" v-model="searchQuery" placeholder="Search" @keypress.enter="search(null)">
        <img src="@/assets/search.svg" alt="" @click="search(null)">
      </div>
      <div class="inline" v-show="!searching">
        <button class="glass hoverable" @click="search('Visual')">Visual</button>
        <button class="glass hoverable" @click="search('Code')">Code</button>
        <button class="glass hoverable" @click="search('Reference')">Reference</button>
      </div>
      <div class="inline" v-show="!searching">
        <p class="text-center">You can search into name, description, and tag of the {{ store.GetDefaultContent().length }} bookmarks or use the quick search.</p>
      </div>
    </div>
    
    <!-- MOST VISITED v-if="(infos=='' && searchQuery.length ==0 )" -->
    <div class="mostVisited" ref="mostVisited">
      <div class="favDisplayFlex col">
        <FavCardVue v-for="(res, index) in store.GetMostVisited(10)" :key="index" :result="res"></FavCardVue>
      </div>
    </div>
    
    <!-- RESULTS -->
    <div v-if="(infos!='')" class="results">
      <p v-if="(results.length==0)" class="infos">{{infos}}</p>
      <div class="favDisplayFlex" :key="forceCardUpdate">
        <ResultCardVue v-for="(res, index) in results" :key="index" :result="res.item" :score="res.score"></ResultCardVue>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from '@/stores/store'
import ResultCardVue from '@/components/ResultCard.vue'
import FavCardVue from '@/components/FavCard.vue'
import { useAuth } from '@/stores/auth'

const auth = useAuth()
const store = useStore()

auth.CheckConnection()

var searchQuery = ref('')
var results = ref([])
var infos = ref("")
var mostVisited = ref(null)
var searchBar = ref(null)
var forceCardUpdate = ref(0)
var searching = ref(false)


function emptySearch()
{
  results.value = []
  infos.value = ""
  searchBar.value.classList.remove('activeSearch')
  mostVisited.value.classList.remove('activeSearch')
  //wait .3s before searching for animation to finish
  setTimeout(() => {
    searching.value = false
  }, 300);
}

function searchAndUpdateUI(query)
{
  results.value = []
  let data = store.search(query)
  results.value = data.results
  infos.value = data.infos
  forceCardUpdate.value++
}

function search(query=null)
{
  let q = query==null ? searchQuery.value : query
  if(query!=null)
    searchQuery.value = query

  if(q.length==0 || q==undefined)
  {
    emptySearch()
    return
  }

  searching.value = true

  //no need to wait for animation if search bar is already active
  if(searchBar.value.classList.contains('activeSearch'))
  {
    searchAndUpdateUI(q)
  }
  else{
    searchBar.value.classList.add('activeSearch')
    mostVisited.value.classList.add('activeSearch')
    //wait .3s before searching for animation to finish
    setTimeout(() => {
      if(searchQuery.value!=0){
        searchAndUpdateUI(q)
      }
    }, 300);
  }
}
</script>

<style lang="scss" scoped>

.rotate{
  &:hover{
      transform-origin: center;
      transform:rotate(180deg);
  }
}

.scale{
  border-radius: 20px;
  transform:scale(1.2);
  transform-origin: center;
  stroke:$text-color;

  &.active{
    stroke: $black;
    background-color: $tertiary;
    border:solid 2px $black;
  }

  &:hover{
      border:solid 2px $white;
      stroke: $white;
  }
}

.home{
  width: 100%;
  height: 100%;
  min-height: 90vh;

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
      background-color: $background-alternative;
      color: $text-color;
    }

    img{
      position: absolute;
      right: 1rem;
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

    .inline{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-top: 1rem;

      button{
        width: 100%;
        height: 50px;
        outline: none;
        color: $text-color;
        font-size: 1.5rem;
        cursor: pointer;        
      }
      p{
        width: 100%;
        margin:0;
        font-style: italic;
        font-size: 1rem;
      }
    }
  }

  .infos{
    font-size: 1.5rem;
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

.help{
  margin:0;
}
</style>
