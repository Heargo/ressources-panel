<template>
    <div class="resultCard" @click="openLink">
        <img :src="result.iconUri" alt="no image :/">
        <p>{{result.name}}</p>
        <p>{{result.tags}}</p>
    </div>
</template>
<script setup>
import { defineProps } from 'vue'

//eslint-disable-next-line
const props = defineProps({
    result: {
        type: Object,
        required: true
    }
})

function openLink()
{
    window.open(props.result.url)
}

</script>
<style lang="scss" scoped>
.resultCard{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    border:2px solid black;    

    img{
        width: 100px;
        height: 100px;
        //cover
        object-fit: cover;
    }
}  
</style>