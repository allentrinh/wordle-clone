<script setup>
import { computed, defineProps } from "vue";

const props = defineProps({
  position: {
    type: String,
    default: () => "right",
    validator: (value) => {
      return ["left", "right"].includes(value);
    },
  },
  visible: Boolean,
});

const drawerClass = computed(() => {
  return {
    "right-0": props.position === "right",
    "translate-x-full": props.position === "right" && !props.visible,
    "left-0": props.position === "left",
    "-translate-x-full": props.position === "left" && !props.visible,
  };
});

const emit = defineEmits(["close"]);
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  console.log({ key });
  if (key !== "escape") return;

  emit("close");
});
</script>

<template>
  <button
    v-if="props.visible"
    class="block absolute inset-0 w-screen h-screen bg-slate-900 opacity-80 border-0 transition-all"
    @click="emit('close')"
  >
    <div class="sr-only">Close drawer</div>
  </button>
  <div
    class="fixed z-10 flex flex-col items-center py-16 px-4 bg-slate-800 max-w-sm w-full h-screen overflow-y-auto transition-all"
    :class="drawerClass"
  >
    <button class="absolute top-2 right-2 text-3xl text-white" @click="emit('close')">
      <span class="sr-only">Close drawer</span>
      &times;
    </button>
    <slot name="header" />
    <slot name="body" />
    <slot name="footer" />
  </div>
</template>
