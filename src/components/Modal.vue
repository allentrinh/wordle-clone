<script setup>
const props = defineProps({
  visible: Boolean,
  size: {
    type: String,
    default: () => "sm",
    validator: (value) => {
      return ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"].includes(value);
    },
  },
});

const emit = defineEmits(["close"]);
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

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
    <div class="sr-only">Close modal</div>
  </button>
  <div
    class="fixed rounded top-1/2 left-1/2 shadow-md bg-slate-800 py-8 px-6 w-full h-auto -translate-x-1/2 -translate-y-1/2 transition-all"
    :class="[
      `max-w-${props.size}`,
      {
        'translate-y-4 opacity-0 pointer-events-none': !visible,
      },
    ]"
  >
    <button class="absolute top-2 right-4 text-3xl text-white" @click="emit('close')">
      <span class="sr-only">Close drawer</span>
      &times;
    </button>
    <slot name="header" />
    <slot name="body" />
    <slot name="footer" />
  </div>
</template>
