<script setup>
import { computed } from "vue";

const props = defineProps({
  message: String,
  type: {
    type: String,
    validator: (value) => {
      return ["danger", "warning", "info", "success", ""].includes(value);
    },
  },
  visible: Boolean,
});

const colors = computed(() => {
  switch (props.type) {
    case "danger":
      return "bg-red-300 text-black";

    case "success":
      return "bg-green-400 text-black";

    case "warning":
      return "bg-yellow-200 text-yellow-900";
  }
});

const visibility = computed(() => {
  return props.visible ? "opacity-100" : "opacity-0 translate-y-8";
});
</script>

<template>
  <div class="rounded py-2 px-6 mb-6 fixed bottom-4 transition-all z-50" :class="[colors, visibility]">
    {{ props.message }}
  </div>
</template>
