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
      return "bg-red-400 text-red-900";

    case "success":
      return "bg-green-400 text-black";
  }
});

const visibility = computed(() => {
  return props.visible ? "opacity-100" : "opacity-0";
});
</script>

<template>
  <div class="rounded py-2 px-6 mb-6 fixed bottom-4 transition-all" :class="[colors, visibility]">
    {{ props.message }}
  </div>
</template>
