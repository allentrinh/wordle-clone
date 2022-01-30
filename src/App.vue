<script setup lang="ts">
import { ref, onMounted } from "vue";
import WordGrid from "./components/WordGrid.vue";
import Keyboard from "./components/Keyboard.vue";
import Drawer from "./components/Drawer.vue";
import Modal from "./components/Modal.vue";
import Toast from "./components/Toast.vue";
import LoginForm from "./components/LoginForm.vue";
import data from "./assets/data/words.json";
import { checkLetter } from "./modules/check-letter";
import feedbackMessages from "./utils/feedback-messages.json";
import { ChartBarIcon } from "@heroicons/vue/solid";
import { supabase, fetchGames, insert } from "./services/Supabase";
import { store, setHistory } from "./store";

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
const lettersUsed = ref([]);
const MAX_ATTEMPTS = 6;
const toastMessage = ref("");
const toastType = ref("");
const toastVisible = ref(false);
const drawerVisible = ref(false);
const loginVisible = ref(false);

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

const addToHistory = (value) => {
  store.history.push(value);
  insert("games", { ...value, user_id: store.user.id });
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

  const solved = word.value === secret.value;
  if (attempts.value === MAX_ATTEMPTS || solved) {
    finished.value = true;
    addToHistory({
      word: secret.value,
      solved,
      attempts: attempts.value,
    });
  }

  if (solved) {
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
  if (loginVisible.value) return;

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

const clearHistory = () => (store.history = []);

const signOut = async () => {
  await supabase.auth.signOut();
  store.user = {};
  clearHistory();
};

onMounted(async () => {
  await initialize();
  store.user = supabase.auth.user();
  const games = await fetchGames();
  setHistory(games);
});
</script>

<template>
  <div class="flex flex-col justify-center items-center min-h-screen w-screen bg-slate-900 py-12 px-4">
    <div class="fixed top-0 left-0 flex justify-end items-center w-full py-4 px-6">
      <button
        v-if="!store.user"
        class="text-white font-semibold py-1 px-4 mr-1 rounded-full hover:bg-slate-700 transition-all"
        @click="loginVisible = true"
      >
        Login
      </button>
      <div v-else>
        <button
          class="text-white font-semibold py-1 px-4 mr-1 rounded-full hover:bg-slate-700 transition-all"
          @click="signOut()"
        >
          Logged in as {{ store.user.email }}
        </button>
      </div>
      <button class="hover:bg-slate-700 rounded-full transition-all" @click="drawerVisible = true">
        <div class="sr-only">View scoreboard</div>
        <ChartBarIcon class="h-8 w-8 p-2 text-white block" />
      </button>
    </div>
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

    <Drawer :visible="drawerVisible" @close="drawerVisible = false">
      <template v-slot:header>
        <h2 class="mb-4 font-bold text-xl uppercase text-white">Scoreboard</h2>
      </template>
      <template v-slot:body>
        <div v-if="!store.history.length" class="flex">
          <p class="text-white">No games played yet</p>
        </div>
        <template v-else>
          <div
            v-for="item in store.history"
            :key="item.word"
            class="flex justify-between items-center w-full rounded mb-1 px-2"
            :class="{ 'bg-red-200': !item.solved, 'bg-green-200': item.solved }"
          >
            <p class="py-1 px-2 font-semibold" :class="{ 'text-red-900': !item.solved, 'text-green-900': item.solved }">
              {{ item.word.toUpperCase() }}
            </p>
            <p class="py-1 px-2 font-semibold" :class="{ 'text-red-900': !item.solved, 'text-green-900': item.solved }">
              {{ item.attempts > 1 ? `${item.attempts} guesses` : `1 guess!` }}
            </p>
          </div>
        </template>
      </template>
    </Drawer>

    <Modal :visible="loginVisible" @close="loginVisible = false">
      <template v-slot:body>
        <LoginForm @close="loginVisible = false" />
      </template>
    </Modal>
  </div>
</template>
