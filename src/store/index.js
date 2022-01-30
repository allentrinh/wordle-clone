import { reactive } from "vue";

export const store = reactive({
  user: {},
  history: [],
});

export const setHistory = (games) => {
  const data = games.data.map((game) => {
    return {
      word: game.word,
      solved: game.solved,
      attempts: game.attempts,
    };
  });
  store.history = data;
};
