import { Accessor, createEffect, createMemo, createSignal } from "solid-js";
import rawAnswerData from "../data/answers.json";
import rawBigCities from "../data/big_cities.json";
import Fuse from "fuse.js";
import { getContext } from "../Context";
import { computeDistanceBetween } from "spherical-geometry-js";

type Props = {
  guesses: Accessor<City[]>;
  addGuess: (newGuess: City) => void;
  win: Accessor<boolean>;
  ans: City;
};

export default function (props: Props) {
  const context = getContext();

  const isFirstGuess = () => props.guesses().length === 0;
  const isSecondGuess = () => props.guesses().length === 1;
  const mountMsg = () =>
    isFirstGuess()
      ? "Enter the name of any capital city to make your first guess!"
      : isSecondGuess()
      ? "Enter the your next guess!"
      : "";

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
      setMsg(`The Mystery Capital is ${props.ans.city_ascii}!`);
    } else if (props.win() && !props.ans.city_ascii) {
      setMsg("You win!");
    }
  });

  let formRef: HTMLFormElement;

  // Search indexes
  const answerIndex = createMemo(() => {
    const answers = rawAnswerData["data"] as City[];
    return new Fuse(answers, {
      keys: ["city", "city_ascii", "admin_name"],
      distance: 1,
      includeScore: true,
    });
  });
  const bigCityIndex = createMemo(() => {
    const bigCities = rawBigCities["data"] as City[];
    return new Fuse(bigCities, {
      keys: ["city", "city_ascii", "admin_name"],
      includeScore: true,
    });
  });

  function findCity(newGuess: string) {
    const searchPhrase = newGuess.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const results = answerIndex().search(searchPhrase);
    if (results.length === 0) {
      setMsg(`"${newGuess}" not found in database.`);
      return;
    }
    const topAnswer = results[0];
    const topScore = topAnswer.score ?? 1;
    if (topScore < 0.025) {
      const existingGuess = props.guesses().find((guess) => {
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
      const bigCitiesFound = bigCityIndex().search(newGuess);
      if (bigCitiesFound.length >= 1) {
        const topBigCity = bigCitiesFound[0];
        const topScore = topBigCity.score ?? 1;
        const { city_ascii, capital, country } = topBigCity.item;
        if (topScore < 0.03) {
          if (!capital) {
            setMsg(`${city_ascii} is not a capital city.`);
          } else {
            setMsg(`${city_ascii} is not ${country}'s primary capital.`);
          }
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
    const newCity = findCity(guess);
    if (!newCity) return;

    props.addGuess(newCity);

    if (newCity.id === props.ans.id) return;
    if (props.guesses().length <= 1) return setMsg(mountMsg);
    const lastGuess = props.guesses()[props.guesses().length - 2];
    const distance = computeDistanceBetween(newCity, props.ans);
    const lastDistance = computeDistanceBetween(lastGuess, props.ans);
    const direction = distance < lastDistance ? "warmer!" : "cooler.";
    setMsg(`${newCity.city_ascii} is ${direction}`);
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
          class="shadow px-2 py-1 md:py-0 w-full border rounded
          text-gray-700 dark:bg-slate-200 dark:text-gray-900
          focus:outline-none focus:shadow-outline disabled:bg-slate-400
          disabled:border-slate-400"
          placeholder="Enter city name here."
          autocomplete="off"
          disabled={props.win() || !props.ans}
          data-cy="guesser"
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
