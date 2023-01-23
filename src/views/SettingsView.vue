<template>
  <div class="settings">
    <h1>Settings</h1>

    <!-- HOME BUTTON -->
    <router-link to="/" class="topRightIcon">
      <img src="@/assets/home.svg" alt="">
    </router-link>

    <!-- Create New favs -->
    <section class="flexCol">
      <h2>Create a fav</h2>
      <input type="text" placeholder="Name" v-model="newFav.name">
      <input type="text" placeholder="Url" v-model="newFav.url">
      <input type="text" placeholder="Description" v-model="newFav.description">
      <!-- tags (multi selection input) -->
      <input type="text" placeholder="Tag1, tag2, etc.." v-model="newFav.tags">
      <button @click="CreateNewFavs">Add a new fav</button>
      <p v-if="feedback2" class="feedback">{{feedback2}}</p>
    </section>

    <!-- Import json -->
    <section class="flexCol">
      <h2>Import</h2>
      <p>Import Firefix bookmarks or custom saved in .json format.</p>
      <input type="file" id="file" ref="file" @change="selectFile" accept=".json">
      <!-- <label for="file">Import</label> -->
      <button v-if="fileSelected" @click="importData">Import</button>
      <p v-if="feedback" class="feedback">{{feedback}}</p>
    </section>

    <!-- Export json -->
    <section class="flexCol">
      <h2>Export</h2>
      <p>Export the current {{store.content.length}} saved bookmarks (include default + custom) in .json format</p>
      <button @click="store.ExportSave">Export to json</button>
      <p v-if="feedback" class="feedback">{{feedback}}</p>
    </section>    

    <section class="flexCol dangerZone">
      <h2>Danger Zone</h2>
      <button @click="store.ResetContent">Reset content</button>
      <button @click="store.ResetContent">Reset visitCount</button>
    </section>

    <section class="flexCol">
      <h2>About</h2>
      <p class="justify">This website is using cookies and localstorage to :
      <br><br>
      <ul>
        <li>store information for cloud syncronisation (if an account is created by an user)</li>
        <li>store locally custom changes to the default set of bookmark made by the user.</li>
      </ul>
      <br>
      The backend of this application is powered by <a href="https://appwrite.io/">Appwrite</a>. All password are encrypted.</p>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { cleanUpJSON, removeInvalid } from '@/js/convertTabsAsJson';
import { useStore } from '@/stores/store'

const store = useStore()
const fileSelected = ref(false)
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
    importedJson.value = JSON.parse(evt.target.result);
    fileSelected.value = true
  }
}

function CreateNewFavs()
{
  feedback2.value = store.AddBookmark(newFav.value)
}

function importData()
{
  if(store.IsValidJson(importedJson.value))
  {
    console.log("custom save")
    feedback.value = store.ImportSave(importedJson.value)
  }
  else{
    console.log("not a custom save")
    let converted = cleanUpJSON(importedJson.value)
    converted = removeInvalid(converted)
    if(converted.length > 0)
    {
      importedJson.value = converted
    }
    feedback.value = store.AddListOfBookmarks(importedJson.value)
  }
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
  padding-bottom: 1rem;
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

  ul{
    margin: 0;
  }
}

.justify{
  text-align: justify;
  a {
    color: $tertiary;
    text-decoration: underline;
  }
}


</style>