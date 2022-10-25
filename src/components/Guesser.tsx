import { Setter } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import data from "../data/filter_cities.json";

type Props = {
  setGuesses: SetStoreFunction<Guess[]>;
  guesses: Guess[];
};

export default function ({ setGuesses, guesses }: Props) {
  const cities = data["data"] as City[];
  let formRef: HTMLFormElement;

  function findGuess(guess: string) {
    return cities.find((city) => {
      const searcher = guess.trimEnd().toLowerCase();
      const indexed = city.city_ascii.toLowerCase();
      return searcher === indexed;
    });
  }

  function enterGuess(e: Event) {
    e.preventDefault();
    const formData = new FormData(formRef);
    const guess = formData.get("guess");
    console.log("Guess:", guess);
    if (typeof guess === "string") {
      const newCity = findGuess(guess);
      console.log("New city:", newCity);
      if (newCity) {
        setGuesses([...guesses, { city: newCity, order: guesses.length }]);
        console.log("Guesses:", guesses);
      }
    }
  }
  return (
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
      />
      <button
        type="submit"
        class="bg-blue-700 dark:bg-purple-800 hover:bg-blue-900 
          dark:hover:bg-purple-900 disabled:bg-blue-900  text-white 
          font-bold py-1 md:py-2 px-4 rounded focus:shadow-outline "
      >
        Enter
      </button>
    </form>
  );
}
