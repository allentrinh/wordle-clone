<script setup lang="ts">
import { computed } from "vue";

type Game = {
  word: string;
  attempts: number;
  solved: boolean;
};

const props = defineProps({
  items: Array,
});

const getPercentage = (attempts: number) => {
  const count = props.items.filter((item) => item.attempts === attempts);
  return (count.length / props.items.length) * 100;
};

const winPercentage = computed(() => {
  const solvedGames = props.items.filter((item) => item.solved);
  return ((solvedGames.length / props.items.length) * 100).toFixed(2);
});

const getCountOfAttempts = (attempts) => {
  return props.items.filter((item) => item.attempts === attempts).length;
};
</script>

<template>
  <div class="flex flex-col items-start pb-4">
    <h2 class="text-white font-bold text-xl uppercase mb-2">Stats</h2>

    <div class="flex justify-items-stretch gap-2 w-full mb-4">
      <div class="rounded bg-slate-700 p-4 grow text-center">
        <p class="text-white">
          <span class="block text-2xl font-bold">{{ props.items.length }}</span>
          game{{ props.items.length !== 1 ? "s" : "" }} played
        </p>
      </div>
      <div class="rounded bg-slate-700 p-4 grow text-center">
        <p class="text-white">
          <span class="block text-2xl font-bold">{{ winPercentage }}%</span> solved
        </p>
      </div>
    </div>

    <h2 class="text-white font-bold text-xl uppercase mb-2">Guess distribution</h2>
    <div v-for="i in 6" :key="i" class="text-white mb-1 flex justify-start items-center w-full">
      <span class="text-lg font-semibold mr-3 w-3 text-right">{{ i }}</span>
      <span class="bg-cyan-700 pl-2 pr-4 rounded text-right" :style="`width: ${getPercentage(i)}%`">{{
        getCountOfAttempts(i)
      }}</span>
    </div>
  </div>
</template>
