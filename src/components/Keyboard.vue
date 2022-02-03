<script setup>
import { defineEmits, defineProps } from "vue";
import keys from "../assets/data/keys.json";
import { LightBulbIcon } from "@heroicons/vue/solid";

const props = defineProps({
  lettersUsed: Array,
  hinted: Boolean,
});

const keyClass = (key) => {
  const letter = props.lettersUsed.find((l) => l.letter === key);
  if (typeof letter === "undefined") return "bg-slate-800 hover:bg-slate-700 active:bg-slate-900";

  switch (letter.status) {
    case 3:
      return "bg-rose-500 text-white";

    case 2:
      return "bg-green-500 text-black";

    case 1:
      return "bg-yellow-500 text-yellow-900 hover:bg-yellow-500 hover:text-yellow-900";

    default:
      return "bg-gray-300 text-gray-900 hover:bg-gray-300 hover:text-gray-900";
  }
};

const emit = defineEmits(["click"]);
</script>

<template>
  <div v-for="(row, i) in keys" :key="`row-${i}`" class="flex justify-center items-center gap-1 mb-1">
    <button
      v-for="key in row"
      :key="key.key"
      class="rounded transition-all text-white p-3"
      :class="keyClass(key.key)"
      @click="$emit('click', key.key)"
    >
      {{ key.key }}
    </button>
  </div>
  <div class="flex justify-center items-center gap-1 mb-1">
    <button
      class="bg-slate-800 hover:bg-slate-700 active:bg-slate-900 rounded transition-all text-white p-3"
      @click="$emit('click', 'backspace')"
    >
      backspace
    </button>
    <button
      class="bg-slate-800 hover:bg-slate-700 active:bg-slate-900 rounded transition-all text-white p-3"
      @click="$emit('click', 'hint')"
    >
      <div class="sr-only">Get a hint</div>
      <LightBulbIcon class="w-5 h-6" :class="{ 'text-yellow-500': props.hinted }" />
    </button>
    <button
      class="bg-slate-800 hover:bg-slate-700 active:bg-slate-900 rounded transition-all text-white p-3"
      @click="$emit('click', 'enter')"
    >
      enter
    </button>
  </div>
</template>
