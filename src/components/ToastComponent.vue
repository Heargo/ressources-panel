<template>
  <div
    v-show="toast.visible"
    :class="{
      visible: toast.visible,
      error: toast.type == 'error',
      warning: toast.type == 'warning',
    }"
  >
    {{ toast.message }}
  </div>
</template>
<script setup>
import { useToast } from "@/stores/toast";
const toast = useToast();
</script>
<style lang="scss" scoped>
div {
  position: fixed;
  transform: translateX(130%);
  display: none;
  bottom: 1rem;
  right: 1rem;
  padding: 1rem;
  min-width: 80px;
  background-color: var(--highlight);
  color: var(--white);
  border-radius: 1rem;
  &.error {
    background-color: var(--red);
    color: var(--black);
  }
  &.warning {
    background-color: var(--yellow);
    color: var(--black);
  }

  &.visible {
    display: block;
    animation: slide-in-then-vanish 2.5s ease;
    animation-fill-mode: forwards;
  }
  @keyframes slide-in-then-vanish {
    0% {
      transform: translateX(130%);
    }
    10% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(0);
    }
  }
}
</style>
