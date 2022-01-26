export const checkLetter = (secret, word, position) => {
  const ABSENT = 0;
  const ALMOST = 1;
  const CORRECT = 2;

  if (secret[position] === word[position]) {
    return CORRECT;
  }

  if (secret.includes(word[position])) {
    return ALMOST;
  }

  return ABSENT;
};
