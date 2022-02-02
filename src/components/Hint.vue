<script setup>
import { ref, computed } from "vue";
import Button from "./Button.vue";
const position = ref(0);
const isHintTriggered = ref(false);
const isLetterVisible = ref(false);

const props = defineProps({
  secret: String,
  lettersUsed: Array,
});

const backgroundClass = (i) => {
  if (i !== position.value || !isHintTriggered.value) return;

  return "bg-green-500 border-green-500";
};

const reset = () => {
  position.value = 0;
  isHintTriggered.value = false;
  isLetterVisible.value = false;
};

const getRandomNumber = (max) => Math.floor(Math.random() * max);

const triggerHint = () => {
  isHintTriggered.value = true;
  // Box animation
  const interval = setInterval(() => {
    position.value = getRandomNumber(5);
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
    const possibleLetters = props.secret.split("");
    const lettersUsed = props.lettersUsed.map((letter) => letter.letter);
    const unusedLetters = possibleLetters.filter((letter) => !lettersUsed.includes(letter));
    const givenLetter = unusedLetters[getRandomNumber(unusedLetters.length)];
    const index = possibleLetters.indexOf(givenLetter);
    position.value = index;
    isLetterVisible.value = true;
  }, 3000);
};

defineExpose({
  reset,
  isHintTriggered,
});
</script>

<template>
  <div>
    <h2 class="text-white font-bold text-xl mb-4 flex items-end">
      {{ isHintTriggered ? "Here's your hint" : "Need a hint?" }}
    </h2>
    <div class="flex gap-2 mb-2">
      <span
        v-for="i in 5"
        class="flex justify-center items-center border border-gray-700 h-10 w-10 uppercase text-xl font-semibold transition-all"
        :class="backgroundClass(i - 1)"
      >
        {{ isLetterVisible && position === i - 1 ? secret[position] : "" }}
      </span>
    </div>
    <div class="flex justify-between items-center h-10">
      <p class="text-sm text-white">You have 10 hints left</p>
      <Button v-if="!isHintTriggered" @click="triggerHint()">Give me a hint</Button>
    </div>
  </div>
</template>
