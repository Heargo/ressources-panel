<template>
  <div class="settings">
    <h1>Settings</h1>

    <!-- HOME BUTTON -->
    <router-link to="/" class="topRightIcon">
      <img src="@/assets/home.svg" alt="">
    </router-link>

    <!-- Import json -->
    <section class="flexCol">
      <input type="file" id="file" ref="file" @change="selectFile" accept=".json">
      <!-- <label for="file">Import</label> -->
      <button v-if="importSucessfull" @click="importData">Import</button>
      <p class="feedback">{{feedback}}</p>
    </section>

    <section class="flexCol dangerZone">
      <h2 class="danger">Danger Zone</h2>
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

.dangerZone{
  margin-top: 2rem;
  width: fit-content;
  position: relative;
  $line-size:200px;
  &::after, &::before{
    content: "";
    position: absolute;
    top:1rem;
    right: -$line-size;
    display: block;
    width: $line-size;
    height: 2px;
    background-color: $dark-red;
    margin: 0 -1rem;
  }
  &::before{
    right: 0;
    left:-$line-size;
    margin: 0 -1rem;
  }
  h2{

    padding: 0;
    margin: 0;
    font-weight: bold;
    color: $dark-red;
  }

  button{
    font-weight: 600;
    background-color: $white;
    color: $dark-red;
    &:hover{
      background-color: $dark-red;
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