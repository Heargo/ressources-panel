<template>
    <button @click="toggleValue" :class="{'active':val}"><div></div></button>
</template>
<script setup>
import { ref,defineEmits,defineProps  } from 'vue'

const props = defineProps({
    defaultValue:{
        type: Boolean,
        default: false
    }
})
const emit = defineEmits(['change'])

const val = ref(props.defaultValue)
const toggleValue = () => {
    val.value = !val.value
    //emit a custom trigger event
    emit('change', val)
}

</script>
<style lang="scss" scoped>
$roundSize: 1.5rem;
button{
    width: 4rem;
    background-color: $secondary;
    border: none;
    border-radius: 2rem;
    padding: .2rem .2rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    outline:none;
    div{
        width: $roundSize;
        height: $roundSize;
        border-radius: 50%;
        
        background-color: $white;
        transition: all 0.2s ease;
        transform: translateX(0);
    }
    &.active{
        background-color: $highlight;
        div{

            transform: translateX(calc(4rem - $roundSize - 0.4rem));
        }
    }
}
</style>