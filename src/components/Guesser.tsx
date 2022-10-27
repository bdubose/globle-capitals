import { SetStoreFunction } from "solid-js/store";
import data from "../data/filter_cities.json";

type Props = {
  setGuesses: SetStoreFunction<GuessStore>;
  guesses: GuessStore;
};

export default function ({ setGuesses, guesses }: Props) {
  const cities = data["data"] as City[];
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
    // console.log("Guess:", guess);
    if (typeof guess === "string") {
      const newCity = findCity(guess, cities);
      // console.log("New city:", newCity);
      if (newCity) {
        const existingGuess = findCity(
          guess,
          guesses.cities.map((g) => g.city)
        );
        if (existingGuess) return console.log(`Already guessed ${guess}.`);
        setGuesses("cities", (prev) => [
          ...prev,
          { city: newCity, order: prev.length },
        ]);
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
