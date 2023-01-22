<template>
    <div class="favCard" @click="openLink">
        <img :src="('https://www.google.com/s2/favicons?domain='+result.url+'&sz=64')" alt="no image :/">
        <p class="name">{{result.name}}</p>
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
})

function openLink()
{
    store.IncrementVisitCount(props.result.id)
    window.open(props.result.url)
}

</script>
<style lang="scss" scoped>
.favCard{
    $card-size: 25px;
    position: relative;
    width: $card-size;
    height: $card-size;
    background-color: $secondary;
    border-radius: 20%;
    padding: .2rem;
    cursor: pointer;

    img{
        width: 100%;
        height: 100%;
        border-radius: 15px;
    }

    p{
        display: none;
        margin: 0;
        font-size: 1.1rem;
        width: 200px;
        //add ... if too long
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;



        text-align: start;
    }
    &:hover{
        p{
            display: block;
            position: absolute;
            //align vertical center
            top: 50%;
            transform: translateY(-50%);
            left: calc($card-size + 1.2rem);
        }
    }
}  
</style>