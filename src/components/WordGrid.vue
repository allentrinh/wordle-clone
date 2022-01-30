<script setup>
import { checkLetter } from "../modules/check-letter";

const props = defineProps({
  word: {
    type: String,
    default: () => "",
  },
  submitted: {
    type: Boolean,
    default: () => false,
  },
  secret: {
    type: String,
    default: () => "",
  },
});

const letterClass = (position) => {
  if (!props.submitted) return "bg-slate-800 text-white";

  const status = checkLetter(props.secret, props.word, position);

  if (status === 2) {
    return "bg-green-500 border-green-500";
  }

  if (status === 1) {
    return "bg-yellow-400 text-yellow-900 border-yellow-400";
  }

  return "bg-gray-500 text-white border-gray-500";
};
</script>

<template>
  <div class="flex gap-2 mb-2">
    <span
      v-for="i in 5"
      class="flex justify-center items-center border border-gray-700 h-10 w-10 uppercase text-xl font-semibold transition-all"
      :class="letterClass(i - 1)"
    >
      {{ word[i - 1] }}
    </span>
  </div>
</template>
