<script setup lang="ts">
import { ref, onMounted } from "vue";
import WordGrid from "./components/WordGrid.vue";
import Keyboard from "./components/Keyboard.vue";
import Toast from "./components/Toast.vue";
import data from "./assets/data/words.json";
import { checkLetter } from "./modules/check-letter";
import feedbackMessages from "./utils/feedback-messages.json";

const secret = ref("");
const guesses = ref([
  {
    word: "",
    submitted: false,
  },
  {
    word: "",
    submitted: false,
  },
  {
    word: "",
    submitted: false,
  },
  {
    word: "",
    submitted: false,
  },
  {
    word: "",
    submitted: false,
  },
  {
    word: "",
    submitted: false,
  },
]);
const word = ref("");
const attempts = ref(0);
const finished = ref(false);
const history = ref([]);
const lettersUsed = ref([]);
const MAX_ATTEMPTS = 6;
const toastMessage = ref("");
const toastType = ref("");
const toastVisible = ref(false);

const initialize = async () => {
  secret.value = getSecret();
  guesses.value = [
    {
      word: "",
      submitted: false,
    },
    {
      word: "",
      submitted: false,
    },
    {
      word: "",
      submitted: false,
    },
    {
      word: "",
      submitted: false,
    },
    {
      word: "",
      submitted: false,
    },
    {
      word: "",
      submitted: false,
    },
  ];
  word.value = "";
  attempts.value = 0;
  finished.value = false;
  lettersUsed.value = [];
};

const getSecret = () => data.data[Math.ceil(Math.random() * data.data.length)];

const submitKey = (key) => {
  switch (key) {
    case "backspace":
      deleteCharacter();
      break;
    case "enter":
      submitWord();
      break;
    default:
      appendLetter(key);
  }
};

const deleteCharacter = () => {
  word.value = `${word.value.substring(0, word.value.length - 1)}`;
  guesses.value[attempts.value] = {
    word: word.value,
    submitted: false,
  };
};

const isValidWord = (word) => {
  return data.data.includes(word);
};

const resetWord = () => {
  word.value = "";
};

const triggerToast = (message: string, type: string) => {
  toastMessage.value = message;
  toastType.value = type;
  toastVisible.value = true;
  setTimeout(() => {
    toastVisible.value = false;
  }, 3000);
};

const submitWord = () => {
  if (word.value.length !== 5) return;

  if (!isValidWord(word.value)) {
    triggerToast(feedbackMessages.errorMessages.invalidWord, "danger");
    return;
  }

  guesses.value[attempts.value] = {
    word: word.value,
    submitted: true,
  };

  attempts.value++;

  word.value.split("").map((w, index) => {
    const status = checkLetter(secret.value, word.value, index);

    // Remove from lettersUsed if already exists and not as high status
    lettersUsed.value = lettersUsed.value.filter((letter, index) => {
      return letter.letter != w || letter.status > status;
    });

    lettersUsed.value = [...lettersUsed.value, { letter: w, status }];
  });

  const guessedCorrectly = word.value === secret.value;
  if (attempts.value === MAX_ATTEMPTS || guessedCorrectly) {
    finished.value = true;
    history.value.push({
      word: secret.value,
      guessedCorrectly,
      attempts: attempts.value,
    });
  }

  if (guessedCorrectly) {
    triggerToast(feedbackMessages.successMessages.correctWord, "success");
  }

  resetWord();
};

const appendLetter = (key) => {
  // Do nothing because we have all the letters we need
  if (word.value.length === 5) return;

  word.value = `${word.value}${key.toLowerCase()}`;
  guesses.value[attempts.value] = {
    word: word.value,
    submitted: false,
  };
};

window.addEventListener("keydown", (event) => {
  const key = event.key;

  // Game finished, do nothing
  if (finished.value) initialize();

  // Delete a character
  if (key.toLowerCase() === "backspace") {
    deleteCharacter();
    return;
  }

  // Submit the word
  if (key.toLowerCase() === "enter") {
    submitWord();
  }

  // Only allow alpha characters
  if (!/^[a-zA-Z]*$/g.test(key)) return;

  // Ignore modifier keys
  if (key.length != 1) return;

  // Append the letter
  appendLetter(key);
});

const clearHistory = () => (history.value = []);

onMounted(async () => {
  await initialize();
});
</script>

<template>
  <div class="flex flex-col justify-center items-center min-h-screen w-screen bg-slate-900 py-12 px-4">
    <h1 class="mb-6 font-bold text-5xl text-gray-200">Wordle</h1>
    <div class="mb-6">
      <WordGrid
        v-for="i in MAX_ATTEMPTS"
        :key="i"
        :word="guesses[i - 1].word"
        :submitted="guesses[i - 1].submitted"
        :secret="secret"
      ></WordGrid>
    </div>

    <Toast :message="toastMessage" :type="toastType" :visible="toastVisible"></Toast>

    <Keyboard :letters-used="lettersUsed" @click="submitKey" />

    <button
      v-if="finished"
      class="rounded bg-cyan-600 text-white font-semibold uppercase py-2 px-6 text-lg"
      @click="initialize"
    >
      New word
    </button>

    <div
      class="flex flex-col items-center mt-8 py-6 px-4 rounded shadow-sm bg-slate-800 w-full"
      style="max-width: 24rem"
    >
      <h2 class="mb-4 font-bold text-xl uppercase text-white">Scoreboard</h2>
      <div v-if="!history.length" class="flex">
        <p class="text-white">No games played yet</p>
      </div>
      <template v-else>
        <div
          v-for="item in history"
          :key="item.secret"
          class="flex justify-between items-center w-full rounded mb-1 px-2"
          :class="{ 'bg-red-200': !item.guessedCorrectly, 'bg-green-200': item.guessedCorrectly }"
        >
          <p
            class="py-1 px-2 font-semibold"
            :class="{ 'text-red-900': !item.guessedCorrectly, 'text-green-900': item.guessedCorrectly }"
          >
            {{ item.word.toUpperCase() }}
          </p>
          <p
            class="py-1 px-2 font-semibold"
            :class="{ 'text-red-900': !item.guessedCorrectly, 'text-green-900': item.guessedCorrectly }"
          >
            {{ item.attempts > 1 ? `${item.attempts} guesses` : `1 guess!` }}
          </p>
        </div>
        <!-- <button
          class="rounded transition-all bg-gray-500 hover:bg-gray-400 text-white font-semibold px-4 py-2 mb-4"
          @click="clearHistory"
        >
          Clear
        </button> -->
      </template>
    </div>
  </div>
</template>
