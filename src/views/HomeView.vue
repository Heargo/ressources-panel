<template>
  <div class="home">
    <input type="url" name="search" v-model="searchQuery" placeholder="search">
    <div v-if="results!={}">
      <ResultCardVue v-for="(res, index) in results" :key="index" :result="res.item"></ResultCardVue>
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
console.log(store.content)
//when search is changed, call search function
watch(searchQuery, (value) => {
  if(value == '' || value==undefined) return
  results.value = store.search(value)
})



</script>
