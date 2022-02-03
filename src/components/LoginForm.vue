<script setup>
import { ref, watch } from "vue";
import { UserAddIcon } from "@heroicons/vue/solid";
import { supabase, fetchGames, fetchHints, upsert } from "../services/Supabase";
import { store, setHistory } from "../store";
import feedbackMessages from "../utils/feedback-messages.json";
import Button from "./Button.vue";

const form = ref({
  email: "",
  password: "",
  confirm: "",
});
const isLoading = ref(false);
const shouldCreateAccount = ref(false);
const errorMessage = ref("");

watch(form, (form, prev) => {
  errorMessage.value = "";
});

const signIn = async () => {
  try {
    const { user, error } = await supabase.auth.signIn({
      email: form.value.email,
      password: form.value.password,
    });
    store.user = user;
    if (!error) {
      const games = await fetchGames();
      setHistory(games);
      emit("toast", { message: "You're logged in!", type: "success" });
      emit("close");
      store.hints = await fetchHints();
    } else {
      emit("toast", { message: error.message, type: "danger" });
    }
  } catch (error) {
    console.error(error);
  }
};

const signUp = async () => {
  if (form.value.password !== form.value.confirm) {
    emit("toast", { message: feedbackMessages.errorMessages.passwordsMatch, type: "danger" });
    return;
  }

  try {
    const { user, error } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.password,
    });

    if (!error) {
      emit("close");
      emit("toast", {
        message: "Thanks for signing up! Don't forget to confirm your email before logging in!",
        type: "success",
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    shouldCreateAccount.value ? signUp() : signIn();
  } catch (error) {
    console.error({ error });
  } finally {
    isLoading.value = false;
  }
};

const toggleCreateAccount = () => {
  errorMessage.value = "";
  shouldCreateAccount.value = !shouldCreateAccount.value;
};

const emit = defineEmits(["close", "toast"]);
</script>

<template>
  <div>
    <div class="mb-6 border-b border-slate-700 pb-6">
      <h2 class="text-white font-bold text-xl mb-2 flex items-end">
        <UserAddIcon v-if="shouldCreateAccount" class="h-6 w-6 inline mr-2" />
        {{ shouldCreateAccount ? "Sign up" : "Login" }}
      </h2>
      <p v-if="shouldCreateAccount" class="text-white">Create an account to save your game data</p>
      <p v-else class="text-white">Log in with your email and password</p>
    </div>
    <form @submit.prevent="handleSubmit">
      <fieldset>
        <label for="email" class="block text-white text-sm font-bold mb-2">Email</label>
        <input
          v-model="form.email"
          id="email"
          type="email"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
        />
      </fieldset>
      <fieldset>
        <label for="password" class="block text-white text-sm font-bold mb-2">Password</label>
        <input
          v-model="form.password"
          id="password"
          type="password"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
        />
        <template v-if="shouldCreateAccount">
          <label for="confirm" class="block text-white text-sm font-bold mb-2">Confirm password</label>
          <input
            v-model="form.confirm"
            id="confirm"
            type="password"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          />
        </template>
      </fieldset>
      <div class="flex justify-between">
        <Button type="submit">
          {{ shouldCreateAccount ? "Sign up" : "Login" }}
        </Button>
        <button type="button" class="text-white hover:underline" :disabled="isLoading" @click="toggleCreateAccount()">
          {{ shouldCreateAccount ? "Go back to login" : "Don't have an account? Sign up!" }}
        </button>
      </div>
    </form>
  </div>
</template>
