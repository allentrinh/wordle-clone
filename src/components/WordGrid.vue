<script setup>
import { defineProps } from "vue";
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
      class="flex justify-center items-center border border-gray-700 h-10 w-10 uppercase text-xl font-semibold transition-all"
      :class="letterClass(0)"
    >
      {{ word[0] }}
    </span>
    <span
      class="flex justify-center items-center border border-gray-700 h-10 w-10 uppercase text-xl font-semibold transition-all"
      :class="letterClass(1)"
    >
      {{ word[1] }}
    </span>
    <span
      class="flex justify-center items-center border border-gray-700 h-10 w-10 uppercase text-xl font-semibold transition-all"
      :class="letterClass(2)"
    >
      {{ word[2] }}
    </span>
    <span
      class="flex justify-center items-center border border-gray-700 h-10 w-10 uppercase text-xl font-semibold transition-all"
      :class="letterClass(3)"
    >
      {{ word[3] }}
    </span>
    <span
      class="flex justify-center items-center border border-gray-700 h-10 w-10 uppercase text-xl font-semibold transition-all"
      :class="letterClass(4)"
    >
      {{ word[4] }}
    </span>
  </div>
</template>
