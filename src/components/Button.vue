<script setup>
import { computed } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: () => "",
  },
});

const className = computed(() => {
  return props.type === "ghost"
    ? "border py-1 px-4 mr-1 rounded-full hover:bg-slate-700"
    : "bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800";
});
</script>

<template>
  <button class="text-white font-semibold py-2 px-4 mr-1 rounded-full transition-all" :class="className">
    <slot />
  </button>
</template>
