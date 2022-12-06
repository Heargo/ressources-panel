<template>
  <div class="home">
    <input type="url" name="search" v-model="searchQuery" placeholder="search">
    <div v-if="results!={}">
      <p v-for="(res, index) in results" :key="index">{{res.item.title}}</p>
    </div>
  </div>
</template>

<script setup>
import { ref,watch } from 'vue'
import { cleanUpJSON } from "@/js/convertTabsAsJson.js"
import { search } from "@/js/search.js"
 //import json
import json from "@/js/tools.json"
//import cleanJ from "@/js/clean.json"

var searchQuery = ref('')
var results = ref({})

var myJson = cleanUpJSON(json);
console.log(myJson)
//when search is changed, call search function
watch(searchQuery, (value) => {
  if(value == '' || value==undefined) return
  results.value = search(myJson,value)
})



</script>
