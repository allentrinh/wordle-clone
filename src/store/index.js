import { reactive } from "vue";

export const store = reactive({
  user: {},
  hints: 0,
  history: [],
});

export const setHistory = (games) => {
  const data = games.data.map((game) => {
    return {
      word: game.word,
      solved: game.solved,
      attempts: game.attempts,
      hint_used: game.hint_used,
    };
  });
  store.history = data;
};
