<script setup lang="ts">
import { ref, onMounted } from "vue";
import WordGrid from "./components/WordGrid.vue";
import Keyboard from "./components/Keyboard.vue";
import Drawer from "./components/Drawer.vue";
import Modal from "./components/Modal.vue";
import Toast from "./components/Toast.vue";
import History from "./components/History.vue";
import Graph from "./components/Graph.vue";
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
  secret.value = localStorage.secret ? atob(localStorage.secret) : getSecret();
  guesses.value = localStorage.guesses
    ? JSON.parse(localStorage.guesses)
    : [
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
  attempts.value = localStorage.attempts || 0;
  finished.value = false;
  lettersUsed.value = localStorage.lettersUsed ? JSON.parse(localStorage.lettersUsed) : [];

  saveStep();
};

const saveStep = () => {
  localStorage.secret = btoa(secret.value);
  localStorage.guesses = JSON.stringify(guesses.value);
  localStorage.attempts = attempts.value;
  localStorage.lettersUsed = JSON.stringify(lettersUsed.value);
  localStorage.finished = finished.value;
};

const clearSteps = () => {
  localStorage.removeItem("secret");
  localStorage.removeItem("guesses");
  localStorage.removeItem("attempts");
  localStorage.removeItem("lettersUsed");
  localStorage.removeItem("finished");
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

const triggerToast = (payload: { message: string; type: string }) => {
  toastMessage.value = payload.message;
  toastType.value = payload.type;
  toastVisible.value = true;
  setTimeout(() => {
    toastVisible.value = false;
  }, 3000);
};

const addToHistory = (value) => {
  store.history.unshift(value);
  if (store.user) {
    insert("games", { ...value, user_id: store.user.id });
  }
};

const addToLettersUsed = () => {
  word.value.split("").map((w, index) => {
    const status = checkLetter(secret.value, word.value, index);

    // Remove from lettersUsed if already exists and not as high status
    lettersUsed.value = lettersUsed.value.filter((letter, index) => {
      return letter.letter != w || letter.status > status;
    });

    lettersUsed.value = [...lettersUsed.value, { letter: w, status }];
  });
};

const submitWord = () => {
  if (word.value.length !== 5) {
    triggerToast({ message: feedbackMessages.errorMessages.invalidLength, type: "warning" });
    return;
  }

  if (!isValidWord(word.value)) {
    triggerToast({ message: feedbackMessages.errorMessages.invalidWord, type: "danger" });
    return;
  }

  guesses.value[attempts.value] = {
    word: word.value,
    submitted: true,
  };
  attempts.value++;
  addToLettersUsed();
  saveStep();

  const solved = word.value === secret.value;
  if (attempts.value === MAX_ATTEMPTS || solved) {
    finished.value = true;
    addToHistory({
      word: secret.value,
      solved,
      attempts: attempts.value,
    });
    clearSteps();
    if (solved) {
      triggerToast({ message: feedbackMessages.successMessages.correctWord, type: "success" });
    } else {
      triggerToast({ message: `The word was ${secret.value.toUpperCase()}`, type: "danger" });
    }
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

  // Game finished, initialize
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
  store.user = null;
  clearHistory();
  clearSteps();
  triggerToast({ message: "Have a good one!", type: "success" });
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
          <div class="flex flex-col justify-between w-full h-full">
            <div class="mb-6">
              <History :items="store.history" />
            </div>
            <Graph :items="store.history" />
          </div>
        </template>
      </template>
    </Drawer>

    <Modal :visible="loginVisible" @close="loginVisible = false">
      <template v-slot:body>
        <LoginForm @close="loginVisible = false" @toast="triggerToast" />
      </template>
    </Modal>
  </div>
</template>
