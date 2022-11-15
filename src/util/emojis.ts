import { computeDistanceBetween } from "spherical-geometry-js";
import { MAX_DISTANCE } from "./constants";

const getColourEmoji = (guess: City, answer: City) => {
  const BLACK_SQUARE = "⬛";
  const PURPLE_SQUARE = "🟪";
  const BLUE_SQUARE = "🟦";
  const GREEN_SQUARE = "🟩";
  const YELLOW_SQUARE = "🟨";
  const ORANGE_SQUARE = "🟧";
  const RED_SQUARE = "🟥";

  if (guess.id === answer.id) return RED_SQUARE;
  const proximity = computeDistanceBetween(guess, answer);
  const scale = proximity / MAX_DISTANCE;
  if (scale < 0.2) {
    return ORANGE_SQUARE;
  } else if (scale < 0.4) {
    return YELLOW_SQUARE;
  } else if (scale < 0.6) {
    return GREEN_SQUARE;
  } else if (scale < 0.8) {
    return BLUE_SQUARE;
  } else if (scale < 1) {
    return PURPLE_SQUARE;
  } else {
    return BLACK_SQUARE;
  }
};

export function emojiString(guesses: City[], answer?: City) {
  if (!answer) return "";
  const chunks = [];
  for (let i = 0; i < guesses.length; i += 8) {
    chunks.push(guesses.slice(i, i + 8));
  }
  const emojiGuesses = chunks
    .map((each) => each.map((guess) => getColourEmoji(guess, answer)).join(""))
    .join("\n");
  return emojiGuesses;
}
