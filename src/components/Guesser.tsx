import { Accessor, createEffect, createSignal } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import rawAnswerData from "../data/answers.json";
import bigCityNames from "../data/big_cities.json";
import Fuse from "fuse.js";
import { getContext } from "../Context";
import { computeDistanceBetween } from "spherical-geometry-js";

// TODO Cities list emptied after I refreshed for first time after new day!
// Note: "Qatar" corrects to "Ulaanbaatar"

type Props = {
  setGuesses: SetStoreFunction<GuessStore>;
  guesses: GuessStore;
  win: Accessor<boolean>;
  ans: City;
};

export default function (props: Props) {
  const context = getContext();

  const isFirstGuess = () => props.guesses.numGuesses === 0;
  const isSecondGuess = () => props.guesses.numGuesses === 1;
  const mountMsg = () =>
    isFirstGuess()
      ? "Enter the name of any capital city to make your first guess!"
      : isSecondGuess()
      ? "Enter the your next guess!"
      : "";

  const answers = rawAnswerData["data"] as City[];
  const [msg, setMsg] = createSignal(mountMsg());
  const msgColour = () => {
    const green = context.theme().isDark
      ? "rgb(134 239 172)"
      : "rgb(22 101 52)";
    const neutral = context.theme().isDark ? "rgb(229 231 235)" : "black";
    return props.win() ? green : neutral;
  };

  createEffect(() => {
    if (props.win() && props.ans.city_ascii) {
      setMsg(`The mystery city is ${props.ans.city_ascii}!`);
    } else if (props.win() && !props.ans.city_ascii) {
      setMsg("You win!");
    }
  });

  let formRef: HTMLFormElement;

  function findCity(newGuess: string, list: City[]) {
    const searchPhrase = newGuess.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const answerIndex = new Fuse(list, {
      keys: ["city", "city_ascii", "admin_name"],
      includeScore: true,
    });
    const results = answerIndex.search(searchPhrase);
    if (results.length === 0) {
      setMsg(`"${newGuess}" not found in database.`);
      return;
    }
    console.log(results);
    const topAnswer = results[0];
    const topScore = topAnswer.score ?? 1;
    if (topScore < 0.025) {
      const existingGuess = props.guesses.cities.find((guess) => {
        return topAnswer.item.id === guess.id;
      });
      if (existingGuess) {
        setMsg(`Already guessed ${existingGuess.city_ascii}.`);
        return;
      }
      return topAnswer.item;
    } else if (topScore < 0.05) {
      setMsg(`Did you mean ${topAnswer.item.city_ascii}?`);
      return;
    } else {
      const bigCityIndex = new Fuse(bigCityNames, {
        includeScore: true,
      });
      const bigCitiesFound = bigCityIndex.search(newGuess);
      if (bigCitiesFound.length >= 1) {
        const topBigCity = bigCitiesFound[0];
        const topScore = topBigCity.score ?? 1;
        if (topScore < 0.03) {
          setMsg(`${topBigCity.item} is not a capital city.`);
          return;
        }
      }
      setMsg(`"${newGuess}" not found in database.`);
    }
  }

  function enterGuess(e: Event) {
    e.preventDefault();
    const formData = new FormData(formRef);
    formRef.reset();
    const guess = formData.get("guess")?.toString().trim();
    if (!guess) return setMsg("Enter your next guess.");
    const newCity = findCity(guess, answers);
    if (!newCity) return;
    if (newCity.capital !== "primary")
      return setMsg(`${newCity.city_ascii} is not a capital city.`);
    props.setGuesses("cities", (prev) => [...prev, newCity]);
    if (props.guesses.numGuesses <= 1) return setMsg(mountMsg);
    const lastGuess = props.guesses.cities[props.guesses.numGuesses - 2];
    const distance = computeDistanceBetween(newCity, props.ans);
    const lastDistance = computeDistanceBetween(lastGuess, props.ans);
    const direction = distance < lastDistance ? "warmer!" : "cooler.";
    if (newCity.id === props.ans.id) return;
    if (props.guesses.numGuesses > 1) {
      setMsg(`${newCity.city_ascii} is ${direction}`);
    }
  }

  return (
    <div class="my-4">
      <form
        onSubmit={enterGuess}
        class="w-80 flex space-x-4 mx-auto my-2 justify-center"
        ref={formRef!}
      >
        <input
          type="text"
          name="guess"
          class="shadow px-2 py-1 md:py-0
          text-gray-700 dark:bg-slate-200 dark:text-gray-900
          focus:outline-none 
          focus:shadow-outline disabled:bg-slate-400
          border rounded disabled:border-slate-400
          w-full"
          placeholder="Enter city name here."
          autocomplete="off"
          disabled={props.win() || !props.ans}
          required
        />
        <button
          type="submit"
          class="bg-blue-700 dark:bg-purple-800 hover:bg-blue-900 
          dark:hover:bg-purple-900 dark:disabled:bg-purple-900 
          disabled:bg-blue-900 text-white 
          font-bold py-1 md:py-2 px-4 rounded focus:shadow-outline"
          disabled={props.win() || !props.ans}
        >
          Enter
        </button>
      </form>
      <p class="text-center font-medium" style={{ color: msgColour() }}>
        {msg()}
      </p>
    </div>
  );
}
