<template>
  <div class="settings">
    <h1>Settings</h1>

    <!-- HOME BUTTON -->
    <router-link to="/" class="topRightIcon">
      <img src="@/assets/home.svg" alt="">
    </router-link>

    <!-- Import json -->
    <section class="flexCol">
      <h2>Import favs</h2>
      <input type="file" id="file" ref="file" @change="selectFile" accept=".json">
      <!-- <label for="file">Import</label> -->
      <button v-if="importSucessfull" @click="importData">Import</button>
      <p class="feedback">{{feedback}}</p>
    </section>

    <!-- Create New favs -->
    <section class="flexCol">
      <h2>Create a fav</h2>
      <input type="text" placeholder="Name" v-model="newFav.name">
      <input type="text" placeholder="Url" v-model="newFav.url">
      <input type="text" placeholder="Description" v-model="newFav.description">
      <!-- tags (multi selection input) -->
      <input type="text" placeholder="Tag1, tag2, etc.." v-model="newFav.tags">
      <button @click="CreateNewFavs">Add a new fav</button>
      <p class="feedback">{{feedback2}}</p>
    </section>

    <section class="flexCol dangerZone">
      <h2>Danger Zone</h2>
      <button @click="store.ResetContent">Reset content</button>
      <button @click="store.ResetContent">Reset visitCount</button>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { cleanUpJSON, removeInvalid } from '@/js/convertTabsAsJson';
import { useStore } from '@/stores/store'

const store = useStore()
const importSucessfull = ref(false)
const importedJson = ref(null)
const feedback = ref("")
const feedback2 = ref("")
const newFav = ref({})


function selectFile(e)
{
  let file = e.target.files[0]
  var reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = function (evt) {
    let fileContents = evt.target.result;
    importJson(fileContents)
  }
}

function CreateNewFavs()
{
  feedback2.value = store.AddBookmark(newFav.value)
}

function importData()
{
  feedback.value = store.AddListOfBookmarks(importedJson.value)
}

function importJson(json)
{
  let converted = JSON.parse(json)
  converted = cleanUpJSON(converted)
  converted = removeInvalid(converted)
  importSucessfull.value = converted.length > 0
  if(importSucessfull.value)
  {
    importedJson.value = converted
  }
}

</script>

<style lang="scss" scoped>

h1{
  color: $white;
}

section{
  margin-top: 2rem;
  width: fit-content;

  input{
    border: none;
    border-radius: 1rem;
    padding: .5rem .8rem;
    font-size: 1rem;
    outline: none;
    border: 0;
  }

  &.dangerZone{
    h2{
      color: $dark-red;
      font-weight: bold;
      &::after, &::before{
        background-color: $dark-red;
      }
    }
    button{
      background-color: $white;
      color: $dark-red;
      &:hover{
        background-color: $dark-red;
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
    background-color: $dark;
    margin: 0 -1rem;
  }
  &::before{
    right: 0;
    left:-$line-size;
    margin: 0 -1rem;
  }
  }

  button{
    font-weight: 600;
    background-color: $white;
    color: $dark;
    &:hover{
      background-color: $dark;
      color: $white;
    }
  }
}

.feedback{
  color: $dark;
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
  background-color: $white;
  border: none;
  border-radius: 1rem;
  padding: .5rem .8rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover{
    background:$dark;
    color: $white;
  }
}

.flexCol{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}


</style>