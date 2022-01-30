<script setup>
const props = defineProps({
  visible: Boolean,
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
    v-if="props.visible"
    class="fixed rounded top-1/2 left-1/2 mx-auto shadow-md bg-slate-800 py-8 px-6 max-w-sm w-full h-auto -translate-x-1/2 -translate-y-1/2"
  >
    <slot name="header" />
    <slot name="body" />
    <slot name="footer" />
  </div>
</template>
