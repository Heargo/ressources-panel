<template>
    <div class="resultCard" @click="openLink">
        <div class="basicInfo">
            <img :src="result.iconUrl" alt="no image :/">
            <p>{{result.name}}</p>
        </div>
        <div class="tags">
            <p v-for="(tag, index) in result.tags" :key="index">{{tag}}</p>
        </div>
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
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    border:2px solid black;    
    .basicInfo{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        p{
            margin: 0;
        }
        img{
            width: 100px;
            height: 100px;
            //cover
            object-fit: cover;
        }
    }
}  
</style>