<template>
    <div class="resultCard" @click="openLink">
        <div class="basicInfo">
            <img :src="('https://www.google.com/s2/favicons?domain='+fav.url+'&sz=64')" alt="no image :/">
            <p v-if="!store.editMode">{{fav.name}}</p>
            <input v-else type="text" v-model="fav.name" :placeholder="result.name" minlength="1">
        </div>
        <div class="tags">
            <p v-for="(tag, index) in fav.tags" :key="index" v-show="tag!=''" :class="{'removable':store.editMode,'plannedToRemoved':InRemovedList(index)}" @click="removeTagToggle(index)">{{tag}}</p>
            <input v-if="store.editMode" type="text" placeholder="new tag" @keypress.enter="addTag">
        </div>
    </div>
</template>
<script setup>
import { defineProps,onMounted,ref,watch } from 'vue'
import { useStore } from '@/stores/store'

const store = useStore()
var fav = ref({})
var removedTags = ref([])
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

onMounted(() => {
    //copy result to fav
    fav.value = JSON.parse(JSON.stringify(props.result))
});

//watch for changes in editMode
watch(()=>store.editMode,()=>{

    //remove tags that are planned to be removed
    removedTags.value.forEach(index => {
        fav.value.tags.splice(index,1)
    });
    removedTags.value = []

    //if not valid name, reset it
    if(fav.value.name=="")
        fav.value.name = props.result.name

    //update bookmark
    store.UpdateBookmark(fav.value.id,fav.value)
})

function InRemovedList(index)
{
    return removedTags.value.includes(index)
}

function openLink()
{   
    if (store.editMode) return;
    console.log("open link")
    store.IncrementVisitCount(props.result.id)
    window.open(props.result.url)
}

function removeTagToggle(index)
{
    if (!store.editMode) return;
    //add index to removedTags
    if(!InRemovedList(index))
    {
        removedTags.value.push(index)
    }else{
        //remove index from removedTags
        removedTags.value = removedTags.value.filter(item => item !== index)
    }
}

function addTag(e)
{
    if (!store.editMode) return;
    if(e.target.value=="") return;
    fav.value.tags.push(e.target.value)
    e.target.value = ""
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
    background-color: $background-alternative;
    border-radius: 15px;
    padding: .3rem 0.8rem;
    cursor: pointer;

    input{
        outline:none;
        border:none;
        border-radius: 1rem;
        padding: 0 1rem;
        max-width: 10ch;
        font-size: 0.8rem;
        background-color: $background-alternative2;
        color: $secondary;
    }

    .basicInfo{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap:1rem;
        width: 100%;
        margin-bottom: 0.5rem;
        p,input{
            margin: 0;
            font-size: 1.2rem;
            //add ... if too long
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        input{
            border-radius: 5px;
            max-width: none;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin:0;
            padding: .1rem .3rem;
            
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
        flex-wrap: wrap;
        p{
            margin: 0;
            padding: 0 1rem;
            font-size: 0.8rem;
            color:$secondary;
            border:solid 1px $secondary;
            //background-color: #878bff;
            border-radius: 1rem;
            &.removable{
                cursor: pointer;
                &:hover{
                    background-color: $red;
                    color: $white;
                }
            }

            &.plannedToRemoved{
                background-color: $red;
                color: $white;
                opacity: 0.2;
            }
        }
    }
}  
</style>