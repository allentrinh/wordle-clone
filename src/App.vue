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
import Hint from "./components/Hint.vue";
import Button from "./components/Button.vue";
import data from "./assets/data/words.json";
import { checkLetter } from "./modules/check-letter";
import feedbackMessages from "./utils/feedback-messages.json";
import { ChartBarIcon, HeartIcon, LightBulbIcon } from "@heroicons/vue/solid";
import { supabase, fetchGames, insert, fetchHints, update } from "./services/Supabase";
import { store, setHistory } from "./store";

const hint = ref(null);
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
const isToastVisible = ref(false);
const isDrawerVisible = ref(false);
const isLoginVisible = ref(false);
const isHelpVisible = ref(false);
const isSignOutVisible = ref(false);
const hasHint = ref(false);
const isHintVisible = ref(false);
const date = new Date();
const helpTips = [
  {
    color: "green",
    shade: 500,
    tip: "This letter is in the word and in the correct spot",
  },
  {
    color: "yellow",
    shade: 400,
    tip: "This letter is in the word, but not in the correct spot",
  },
  {
    color: "gray",
    shade: 500,
    tip: "This letter not in the word",
  },
];
const isHintMessageVisible = ref(false);

const initialize = async () => {
  if (finished.value && hint.value) hint.value.reset();

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

const getAHint = () => {
  hasHint.value = true;
  isHintVisible.value = true;
};

const submitKey = (key) => {
  if (finished.value) {
    initialize();
    return;
  }

  switch (key) {
    case "backspace":
      deleteCharacter();
      break;
    case "enter":
      submitWord();
      break;
    case "hint":
      getAHint();
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

const isValidWord = async (word) => {
  if (data.data.includes(word)) return true;

  const endpoint = "https://www.merriam-webster.com/dictionary";
  const response = await fetch(`${endpoint}/${word}`);
  return response.status === 200;
};

const resetWord = () => {
  word.value = "";
};

const triggerToast = (payload: { message: string; type: string }) => {
  toastMessage.value = payload.message;
  toastType.value = payload.type;
  isToastVisible.value = true;
  setTimeout(() => {
    isToastVisible.value = false;
  }, 3000);
};

const addToHistory = (value) => {
  store.history.unshift({ ...value, hint_used: hint.value.isHintTriggered });
  if (store.user) {
    insert("games", { ...value, user_id: store.user.id, hint_used: hint.value.isHintTriggered });
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

const submitWord = async () => {
  if (word.value.length !== 5) {
    triggerToast({ message: feedbackMessages.errorMessages.invalidLength, type: "warning" });
    return;
  }

  const isValid = await isValidWord(word.value);
  if (!isValid) {
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
      let appendMessage = "";
      if (attempts.value <= 3 && !hint.isHintTriggered) {
        store.hints++;
        update("profiles", { id: store.user.id }, { hints: store.hints });
        appendMessage = "And you scored a hint!";
      }
      triggerToast({ message: `${feedbackMessages.successMessages.correctWord} ${appendMessage}`, type: "success" });
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
  if (isLoginVisible.value) return;

  const key = event.key;

  // Game finished, initialize
  if (finished.value) {
    initialize();
    return;
  }

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
  localStorage.removeItem("supabase.auth.token");
  clearHistory();
  clearSteps();
  triggerToast({ message: "Have a good one!", type: "success" });
};

const disableFeatureMessage = () => {
  isHintMessageVisible.value = false;
  localStorage.feature = false;
};

onMounted(async () => {
  await initialize();
  store.user = supabase.auth.user();
  store.hints = await fetchHints();
  const games = await fetchGames();
  setHistory(games);
  if (!localStorage.feature) isHintMessageVisible.value = true;
});
</script>

<template>
  <div class="flex flex-col justify-between items-center min-h-screen w-screen bg-slate-900">
    <header class="flex justify-between items-center w-full py-4 px-6">
      <button
        class="text-white font-semibold py-1 px-4 mr-1 rounded-full hover:bg-slate-700 transition-all"
        @click="isHelpVisible = true"
      >
        How to play
      </button>
      <div class="flex justify-between items-center">
        <button
          v-if="!store.user || Object.keys(store.user).length === 0"
          class="text-white font-semibold py-1 px-4 mr-1 rounded-full hover:bg-slate-700 transition-all"
          @click="isLoginVisible = true"
        >
          Login
        </button>
        <div v-else>
          <button
            class="text-white font-semibold py-1 px-4 mr-1 rounded-full hover:bg-slate-700 transition-all"
            @click="isSignOutVisible = true"
          >
            Sign out
          </button>
        </div>
        <button class="hover:bg-slate-700 rounded-full transition-all" @click="isDrawerVisible = true">
          <div class="sr-only">View scoreboard</div>
          <ChartBarIcon class="h-8 w-8 p-2 text-white block" />
        </button>
      </div>
    </header>

    <main class="flex flex-col justify-center items-center">
      <h1 class="mb-4 md:mb-6 font-bold text-2xl md:text-5xl text-gray-200">A Diction</h1>
      <div class="mb-6">
        <WordGrid
          v-for="i in MAX_ATTEMPTS"
          :key="i"
          :word="guesses[i - 1].word"
          :submitted="guesses[i - 1].submitted"
          :secret="secret"
        ></WordGrid>
      </div>

      <Toast :message="toastMessage" :type="toastType" :visible="isToastVisible"></Toast>

      <Keyboard :letters-used="lettersUsed" @click="submitKey" />

      <button
        v-if="finished"
        class="rounded bg-cyan-700 text-white font-semibold uppercase py-2 px-6 text-lg"
        @click="initialize"
      >
        New word
      </button>
    </main>

    <footer class="py-4 px-6 flex flex-col items-center">
      <p class="text-white">
        &copy; {{ date.getFullYear() }} - Made with love by
        <a href="https://allentrinh.com" class="underline" target="_blank">Allen Trinh</a>
      </p>
      <p>
        <a
          href="https://www.paypal.com/donate/?business=MTVYUAT6RSYJ4&no_recurring=1&item_name=Send+me+a+coffee+to+keep+me+coding.&currency_code=USD"
          class="text-white underline"
          target="_blank"
        >
          Buy me a coffee <HeartIcon class="w-4 h-4 text-white inline" />
        </a>
      </p>
    </footer>

    <Drawer :visible="isDrawerVisible" @close="isDrawerVisible = false">
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

    <Modal :visible="isLoginVisible" @close="isLoginVisible = false">
      <template v-slot:body>
        <LoginForm @close="isLoginVisible = false" @toast="triggerToast" />
      </template>
    </Modal>

    <Modal :visible="isHelpVisible" size="sm" @close="isHelpVisible = false">
      <template v-slot:header>
        <h2 class="text-white font-bold text-xl mb-2 flex items-end">How to play</h2>
      </template>

      <template v-slot:body>
        <p class="text-white mb-4">A super simple and casual game!</p>
        <p class="text-white mb-4">You have 6 attempts to guess the word correctly.</p>
        <p class="text-white mb-4">
          Each attempt must have 5 letters. Hit the enter button to see if you got it right!
        </p>
        <p class="text-white mb-4">After each submission, we'll let you know how close each letter is.</p>
        <div class="p-4 pb-1 bg-slate-900 rounded mb-4">
          <div v-for="tip in helpTips" :key="tip.color" class="flex mb-4 items-center">
            <span class="block rounded w-8 h-8 mr-2 shrink-0" :class="`bg-${tip.color}-${tip.shade}`"></span>
            <p class="text-white leading-none">
              <span class="sr-only">{{ tip.color }} means</span> {{ tip.tip }}
            </p>
          </div>
        </div>

        <p class="text-white mb-4">
          If you get stuck and need a hint, try pressing the <LightBulbIcon class="h-5 w-5 text-white inline" />
          <span class="sr-only">lightbulb</span> icon! Earn hints by solving words without the use of hints in 3 turns
          or less!
        </p>
        <p class="text-white mb-4">One hint per word!</p>
        <p class="text-white mb-4">Have fun!</p>
      </template>
    </Modal>

    <Modal :visible="isSignOutVisible" size="sm" @close="isSignOutVisible = false">
      <template v-slot:header>
        <h2 class="text-white font-bold text-xl mb-4 flex items-end">Are you sure you want to sign out?</h2>
      </template>

      <template v-slot:body>
        <div class="flex justify-end">
          <button
            class="text-white border font-semibold py-1 px-4 mr-1 rounded-full hover:bg-slate-700 transition-all"
            @click="isSignOutVisible = false"
          >
            Cancel
          </button>
          <Button
            @click="
              isSignOutVisible = false;
              signOut();
            "
          >
            Yes, sign out
          </Button>
        </div>
      </template>
    </Modal>

    <Modal :visible="isHintVisible" size="sm" @close="isHintVisible = false">
      <template v-slot:body>
        <Hint v-if="store.user" ref="hint" :letters-used="lettersUsed" :secret="secret" />
        <div v-else>
          <h2 class="text-white font-bold text-xl mb-4 flex items-end">You must login to gain access to hints</h2>
          <div class="flex justify-end">
            <Button type="ghost" @click="isHintVisible = false">Cancel</Button>
            <Button
              @click="
                isHintVisible = false;
                isLoginVisible = true;
              "
              >Login now</Button
            >
          </div>
        </div>
      </template>
    </Modal>

    <Modal :visible="isHintMessageVisible" size="sm" @close="isHintMessageVisible = false">
      <template v-slot:header>
        <h2 class="text-white font-bold text-xl mb-4 flex items-end">Hints are here!</h2>
      </template>
      <template v-slot:body>
        <p class="text-white">
          Check your keyboard for a new hint feature! Login to take advantage of hints for those super tricky words!
        </p>
      </template>
      <template v-slot:footer>
        <div class="pt-4 text-right">
          <Button @click="disableFeatureMessage()">Got it, thanks! Don't show again</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>
