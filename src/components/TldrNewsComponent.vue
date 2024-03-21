<template>
  <div>
    <a :href="baseURL+store.tldrSubject+'/'+today" target="_blank">
      <img
        :src="require(`@/assets/${store.userTheme}/newspaper-outline.svg`)"
      />
    </a>
  </div>
</template>
<script setup>
import { useStore } from "@/stores/store";

const store = useStore();
const baseURL = "https://tldr.tech/";

//get today week day
const today = new Date().toISOString().split("T")[0];

</script>
<style lang="scss" scoped>

</style>
