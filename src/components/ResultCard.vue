<template>
    <div class="resultCard" @click="openLink">
        <div class="basicInfo">
            <img :src="('https://www.google.com/s2/favicons?domain='+result.url)" alt="no image :/">
            <p>{{result.name}}</p>
        </div>
        <div class="tags">
            <p v-for="(tag, index) in result.tags" :key="index" v-show="tag!=''">{{tag}}</p>
        </div>
    </div>
</template>
<script setup>
import { defineProps } from 'vue'
import { useStore } from '@/stores/store'

const store = useStore()

//eslint-disable-next-line
const props = defineProps({
    result: {
        type: Object,
        required: true
    },
    score:{
        type: Number,
        required: true
    }
})

function openLink()
{
    store.IncrementVisitCount(props.result.id)
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
    max-width: 300px;
    background-color: $white;
    border-radius: 15px;
    padding: .3rem 0.8rem;
    cursor: pointer;
    .basicInfo{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap:1rem;
        width: 100%;
        margin-bottom: 0.5rem;
        p{
            margin: 0;
            color:$dark;
            font-size: 1.2rem;
            //add ... if too long
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        img{
            width: 20px;
            //cover
            object-fit: cover;
        }
    }

    .tags{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        gap:0.3rem;
        //flex-wrap: wrap;
        p{
            margin: 0;
            padding: 0 1rem;
            font-size: 0.8rem;
            color: $dark;
            border:solid 1px $dark;
            //background-color: #878bff;
            border-radius: 1rem;
        }
    }

    .score{
        color:$dark;
    }
}  
</style>