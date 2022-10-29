import dayjs from "dayjs";
import {
  createEffect,
  createSignal,
  lazy,
  onCleanup,
  onMount,
  Suspense,
} from "solid-js";
import { createStore } from "solid-js/store";
import { computeDistanceBetween } from "spherical-geometry-js";
import Guesser from "../components/Guesser";
import List from "../components/List";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ans } from "../util/answer";
import data from "../data/filter_cities.json";

const GameGlobe = lazy(() => import("../components/globes/GameGlobe"));

export default function () {
  // Signals
  const [pov, setPov] = createSignal<Coords | null>(null);
  const [win, setWin] = createSignal(false);
  const cities = data["data"] as City[];

  // Local storage
  const noCities = { cities: [] as string[] };
  const [storedGuesses, storeGuesses] = useLocalStorage<typeof noCities>(
    "guesses",
    {
      ...noCities,
    }
  );

  const restoredGuesses = () =>
    storedGuesses()
      .cities.map((cityName, idx) => {
        const city = cities.find((c) => c.city_ascii === cityName);
        return { city, order: idx };
      })
      .filter((guess) => Boolean(guess.city)) as Guess[];

  // Stores
  const [guesses, setGuesses] = createStore({
    cities: restoredGuesses() as Guess[],
    get sortedGuesses() {
      const copy = [...this.cities];
      return copy.sort((a, z) => {
        const proximityA = computeDistanceBetween(a.city, ans);
        const proximityB = computeDistanceBetween(z.city, ans);
        return proximityA - proximityB;
      });
    },
    get numGuesses() {
      return this.cities.length;
    },
    get closest() {
      const closestCity = this.sortedGuesses[0];
      return computeDistanceBetween(closestCity.city, ans);
    },
  });

  // Effects
  createEffect(() => {
    const winningGuess = guesses.cities.find(({ city }) => city.id === ans.id);
    if (winningGuess) setWin(true);
  });

  // Stores guesses when new guess added
  // TODO guesses not resetting on globle??
  onMount(() => {
    if (storedGuesses().cities.length === 0) {
      setGuesses({ cities: [] });
      return;
    }
  });

  // Resets guesses when stored guesses expired
  createEffect(() => {
    // onCleanup(() => {
    console.log("Running storing effect.");
    const storable = guesses.cities.map((guess) => guess.city.city_ascii);
    console.log("storable", storable);
    storeGuesses({ cities: storable });
  });
  // createEffect(() => {
  //   if (restoredGuesses().length === 0) {
  //     setGuesses({ cities: [] });
  //   }
  // });

  return (
    <div>
      <Guesser setGuesses={setGuesses} guesses={guesses} win={win} />
      <Suspense fallback={<p>Loading...</p>}>
        <GameGlobe guesses={guesses} pov={pov} />
      </Suspense>
      <List guesses={guesses} setPov={setPov} />
    </div>
  );
}
