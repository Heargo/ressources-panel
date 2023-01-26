<template>
  <div class="flexCol">
    <h1>Settings</h1>

    <!-- HOME BUTTON -->
    <router-link to="/" class="topRightIcon">
      <img src="@/assets/home.svg" alt="">
    </router-link>

    <!-- Create New favs -->
    <section class="flexCol glass">
      <h2>Create a fav</h2>
      <input type="text" placeholder="Name" v-model="newFav.name">
      <input type="text" placeholder="Url" v-model="newFav.url">
      <input type="text" placeholder="Description" v-model="newFav.description">
      <!-- tags (multi selection input) -->
      <input type="text" placeholder="Tag1, tag2, etc.." v-model="newFav.tags">
      <ButtonComponent @click="CreateNewFavs">Add a new fav</ButtonComponent>
    </section>

    <!-- Import json -->
    <section class="flexCol glass">
      <h2>Import</h2>
      <p>Import Firefix bookmarks or custom saved in .json format.</p>
      <input type="file" id="file" ref="file" @change="selectFile" accept=".json">
      <!-- <label for="file">Import</label> -->
      <ButtonComponent v-if="fileSelected" @click="importData">Import</ButtonComponent>
      <p v-if="feedback" class="text-center">{{feedback}}</p>
    </section>

    <!-- Export json -->
    <section class="flexCol glass">
      <h2>Export</h2>
      <p>Export the current {{store.content.length}} saved bookmarks (include default + custom) in .json format</p>
      <ButtonComponent @click="store.ExportSave">Export to json</ButtonComponent>
      <p v-if="feedback" class="text-center">{{feedback}}</p>
    </section>    

    <section class="flexCol dangerZone glass">
      <h2>Danger Zone</h2>
      <ButtonComponent @click="store.ResetContent" classes="red">Reset content</ButtonComponent>
      <ButtonComponent @click="store.ResetVisitCount" classes="red">Reset visitCount</ButtonComponent>
    </section>

    <section class="flexCol glass" style="margin-bottom: 1rem;">
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

//components
import ButtonComponent from '@/components/ButtonComponent.vue'

const store = useStore()
const fileSelected = ref(false)
const importedJson = ref(null)
const feedback = ref("")
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
  store.AddBookmark(newFav.value)
}

function importData()
{
  if(store.IsValidJson(importedJson.value))
  {
    console.log("custom save")
    store.ImportSave(importedJson.value)
  }
  else{
    console.log("not a custom save")
    let converted = cleanUpJSON(importedJson.value)
    converted = removeInvalid(converted)
    if(converted.length > 0)
    {
      importedJson.value = converted
    }
    store.AddListOfBookmarks(importedJson.value)
  }
}

</script>

<style lang="scss" scoped>

</style>