import { Accessor, createEffect, createResource, createSignal } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import rawCityData from "../data/filter_cities.json";
import { getAnswer } from "../util/encryption";
import { theme } from "../util/globalState";

type Props = {
  setGuesses: SetStoreFunction<GuessStore>;
  guesses: GuessStore;
  win: Accessor<boolean>;
};

export default function ({ setGuesses, guesses, win }: Props) {
  const [ans] = createResource(getAnswer);

  const cities = rawCityData["data"] as City[];
  const [msg, setMsg] = createSignal("");
  const msgColour = () => {
    const green = theme().isDark ? "rgb(134 239 172)" : "rgb(134 239 172)";
    if (win()) return green;
    if (msg().includes("not a capital city")) return "orangered";
    return win() ? green : "rgb(185 28 28)";
  };

  createEffect(() => {
    if (ans.loading) {
      setMsg("");
    } else if (ans.error) {
      setMsg("An error has occurred. Please try again later.");
    } else if (win() && ans()?.city_ascii) {
      setMsg(`The mystery city is ${ans()?.city_ascii}!`);
    } else if (win() && !ans()?.city_ascii) {
      setMsg("You win!");
    }
  });

  let formRef: HTMLFormElement;

  function findCity(guess: string, list: City[]) {
    return list.find((city) => {
      const searcher = guess.trimEnd().toLowerCase();
      const indexed = city.city_ascii.toLowerCase();
      return searcher === indexed;
    });
  }

  function enterGuess(e: Event) {
    e.preventDefault();
    const formData = new FormData(formRef);
    formRef.reset();
    const guess = formData.get("guess");
    if (typeof guess !== "string") return setMsg("Error entering city name.");
    const newCity = findCity(guess, cities);
    if (!newCity) return setMsg(`"${guess}" not found in database.`);
    const existingGuess = findCity(
      guess,
      guesses.cities.map((g) => g.city)
    );
    if (existingGuess) return setMsg(`Already guessed ${guess}.`);
    setGuesses("cities", (prev) => [
      ...prev,
      { city: newCity, order: prev.length },
    ]);
    if (newCity.id === ans()?.id) return;
    if (newCity.capital !== "primary")
      return setMsg(`${newCity.city_ascii} is not a capital city.`);
    return setMsg("");
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
          disabled={win()}
        />
        <button
          type="submit"
          class="bg-blue-700 dark:bg-purple-800 hover:bg-blue-900 
          dark:hover:bg-purple-900 dark:disabled:bg-purple-900 disabled:bg-blue-900  text-white 
          font-bold py-1 md:py-2 px-4 rounded focus:shadow-outline"
          disabled={win()}
        >
          Enter
        </button>
      </form>
      <p class="text-center font-bold" style={{ color: msgColour() }}>
        {msg()}
      </p>
    </div>
  );
}
