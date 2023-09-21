<template>
  <div class="glass flex-col" @click="closeCard">
    <div
      @mouseover="hoverCard = true"
      @mouseout="hoverCard = false"
      class="card flex-col"
    >
      <div class="flex-row w-100">
        <img
          :src="
            'https://www.google.com/s2/favicons?domain=' + item.url + '&sz=128'
          "
          alt="icon"
        />
        <h2>{{ item.name }}</h2>
      </div>
      <div class="tags flex-row">
        <p
          v-for="(tag, index) in item.tags"
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
      </div>
      <p>{{ item.description }}</p>
      <a :href="item.url" target="blank">{{ item.url }}</a>
    </div>
  </div>
</template>
<script setup>
import { defineProps, ref, onMounted, watch } from "vue";
import { useStore } from "@/stores/store";
import { defineEmits } from "vue";

const store = useStore();
const emits = defineEmits(["closeCardInfo"]);

var fav = ref({});
var removedTags = ref([]);
var hoverCard = ref(false);

//eslint-disable-next-line
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});
onMounted(() => {
  //copy result to fav
  fav.value = JSON.parse(JSON.stringify(props.item));
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

function closeCard() {
  if (hoverCard.value) return;

  //enable scroll
  document.body.style.overflow = "auto";
  emits("closeCardInfo");
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

// function addTag(e)
// {
//     if (!store.editMode) return;
//     if(e.target.value=="") return;
//     fav.value.tags.push(e.target.value)
//     e.target.value = ""
// }
</script>
<style lang="scss" scoped>
.glass {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
}

.card {
  justify-content: flex-start;
  background-color: var(--background);
  border-radius: 10px;
  padding: 1rem;
  width: 100%;
  max-width: 500px;

  img {
    width: 32px;
    aspect-ratio: 1/1;
  }
  h2 {
    margin: 0;
    font-size: 2rem;
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
    font-size: 1.4rem;
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
}

.tags {
  width: 100%;
  gap: 0.3rem;
  flex-wrap: wrap;
  p {
    margin: 0;
    padding: 0 1rem;
    font-size: 1.2rem;
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
</style>
