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
  return (solvedGames.length / props.items.length) * 100;
});
</script>

<template>
  <div class="flex flex-col items-start">
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
    <div
      v-for="i in 6"
      :key="i"
      class="bg-cyan-700 bg text-white mb-1 pl-2 pr-4 text-lg font-semibold rounded"
      :style="`width: ${getPercentage(i)}%`"
    >
      {{ i }}
    </div>
  </div>
</template>
