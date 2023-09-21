<template>
  <button :class="props.classes"><slot></slot></button>
</template>
<script setup>
//use props to pass class
import { defineProps } from "vue";
const props = defineProps({
  classes: String,
});
</script>
<style lang="scss" scoped>
button {
  border: none;
  border-radius: 1rem;
  padding: 0.5rem 0.8rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--button);
  color: var(--button-txt);
  filter: brightness(0.9);
  &:hover {
    transform: scale(1.05);
    //make the all button darker (filter)
    filter: brightness(1.1);
  }
  &.bigger {
    font-size: 1.5rem;
    padding: 0.2rem 1rem;
  }
  &.red {
    background-color: var(--white);
    color: var(--red);
    font-weight: bold;
    &:hover {
      background-color: var(--red);
      color: var(--white);
    }
  }
}
</style>
