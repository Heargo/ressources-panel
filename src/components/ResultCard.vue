<template>
  <div class="resultCard glass variant" @click="openLink">
    <svg
      @mouseover="hoverInfo = true"
      @mouseout="hoverInfo = false"
      @click="showCardInfo"
      class="infoToggle ionicon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path
        d="M248 64C146.39 64 64 146.39 64 248s82.39 184 184 184 184-82.39 184-184S349.61 64 248 64z"
        fill="none"
        stroke="#94a1b2"
        stroke-miterlimit="10"
        stroke-width="32"
      />
      <path
        fill="none"
        stroke="#94a1b2"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="32"
        d="M220 220h32v116"
      />
      <path
        fill="none"
        stroke="#94a1b2"
        stroke-linecap="round"
        stroke-miterlimit="10"
        stroke-width="32"
        d="M208 340h88"
      />
      <path
        class="fill"
        fill="#94a1b2"
        d="M248 130a26 26 0 1026 26 26 26 0 00-26-26z"
      />
    </svg>
    <div class="basicInfo">
      <img
        :src="'https://www.google.com/s2/favicons?domain=' + fav.url + '&sz=64'"
        alt="no image :/"
      />
      <p v-if="!store.editMode">{{ fav.name }}</p>
      <input
        v-else
        type="text"
        v-model="fav.name"
        :placeholder="result.name"
        minlength="1"
      />
    </div>
    <div class="tags">
      <p
        v-for="(tag, index) in fav.tags"
        :key="index"
        v-show="tag != ''"
        :class="{
          removable: store.editMode,
          plannedToRemoved: InRemovedList(index),
        }"
        @click="removeTagToggle(index)"
      >
        {{ tag }}
      </p>
      <input
        v-if="store.editMode"
        type="text"
        placeholder="new tag"
        @keypress.enter="addTag"
      />
    </div>
  </div>
</template>
<script setup>
import { defineProps, onMounted, ref, watch } from "vue";
import { useStore } from "@/stores/store";
import { defineEmits } from "vue";

const store = useStore();
const emits = defineEmits(["showCardInfo"]);
var fav = ref({});
var removedTags = ref([]);
var hoverInfo = ref(false);
//eslint-disable-next-line
const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
});

onMounted(() => {
  //copy result to fav
  fav.value = JSON.parse(JSON.stringify(props.result));
});

//watch for changes in editMode
watch(
  () => store.editMode,
  () => {
    //remove tags that are planned to be removed
    removedTags.value.forEach((index) => {
      fav.value.tags.splice(index, 1);
    });
    removedTags.value = [];

    //if not valid name, reset it
    if (fav.value.name == "") fav.value.name = props.result.name;

    //update bookmark
    store.UpdateBookmark(fav.value.id, fav.value);
  }
);

function InRemovedList(index) {
  return removedTags.value.includes(index);
}

function openLink() {
  if (store.editMode) return;
  if (hoverInfo.value) return;

  store.IncrementVisitCount(props.result.id);
  window.open(props.result.url);
}

function showCardInfo() {
  //emit showCardInfo event
  emits("showCardInfo", fav.value);
}

function removeTagToggle(index) {
  if (!store.editMode) return;
  //add index to removedTags
  if (!InRemovedList(index)) {
    removedTags.value.push(index);
  } else {
    //remove index from removedTags
    removedTags.value = removedTags.value.filter((item) => item !== index);
  }
}

function addTag(e) {
  if (!store.editMode) return;
  if (e.target.value == "") return;
  fav.value.tags.push(e.target.value);
  e.target.value = "";
}
</script>
<style lang="scss" scoped>
.resultCard {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  max-width: 300px;
  background-color: var(--background-alternative);
  border-radius: 15px;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  input {
    outline: none;
    border: none;
    border-radius: 1rem;
    padding: 0 1rem;
    max-width: 10ch;
    font-size: 0.8rem;
    background-color: var(--background-alternative2);
    color: var(--secondary);
  }

  .infoToggle {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    width: 1.5rem;
    aspect-ratio: 1/1;
    z-index: 10;
    &:hover {
      path {
        stroke: var(--tertiary);
      }
      .fill {
        fill: var(--tertiary);
      }
    }
  }

  .basicInfo {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
    width: calc(100% - 1.75rem);
    margin-bottom: 0.5rem;
    p,
    input {
      margin: 0;
      font-size: 1.2rem;
      //add ... if too long
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    input {
      border-radius: 5px;
      max-width: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
      padding: 0.1rem 0.3rem;
    }
    img {
      width: 20px;
      //cover
      object-fit: cover;
    }
  }

  .tags {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    gap: 0.3rem;
    flex-wrap: wrap;
    p {
      margin: 0;
      padding: 0 1rem;
      font-size: 0.8rem;
      color: var(--secondary);
      border: solid 1px var(--secondary);
      //background-color: #878bff;
      border-radius: 1rem;
      &.removable {
        cursor: pointer;
        &:hover {
          background-color: var(--red);
          color: var(--white);
        }
      }

      &.plannedToRemoved {
        background-color: var(--red);
        color: var(--white);
        opacity: 0.2;
      }
    }
  }
}
</style>
