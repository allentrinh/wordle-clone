<script setup>
import { ref, computed } from "vue";
import { store } from "../store";

const pages = ref(1);
const itemsPerPage = 5;

const items = computed(() => {
  const items = store.history;

  const data = [];
  let i = 0;
  console.log(`should show up to ${pages.value * itemsPerPage}`);
  while (data.length < pages.value * itemsPerPage && i != items.length) {
    data.push(items[i]);
    i++;
  }

  return data;
});
</script>

<template>
  <div>
    <div
      v-for="item in items"
      :key="item.word"
      class="flex justify-between items-center w-full rounded mb-1 px-2"
      :class="{ 'bg-red-200': !item.solved, 'bg-green-200': item.solved }"
    >
      <p class="py-1 px-2 font-semibold" :class="{ 'text-red-900': !item.solved, 'text-green-900': item.solved }">
        {{ item.word.toUpperCase() }}
      </p>
      <p class="py-1 px-2 font-semibold" :class="{ 'text-red-900': !item.solved, 'text-green-900': item.solved }">
        {{ item.attempts > 1 ? `${item.attempts} guesses` : `1 guess!` }}
      </p>
    </div>
    <div class="flex gap-2 py-2">
      <button
        v-if="items.length < store.history.length"
        class="rounded bg-cyan-600 text-white font-semibold uppercase py-2 px-6 grow"
        @click="pages++"
      >
        Load more
      </button>
      <button class="rounded border border-white text-white font-semibold uppercase py-2 px-6 grow" @click="pages = 1">
        Show less
      </button>
    </div>
  </div>
</template>
