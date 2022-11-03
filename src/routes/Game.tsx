import dayjs from "dayjs";
import {
  createEffect,
  createSignal,
  lazy,
  on,
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
import { firstStats } from "../components/Statistics";
import { setShowStats } from "../App";

const GameGlobe = lazy(() => import("../components/globes/GameGlobe"));

export default function () {
  // Signals
  const [pov, setPov] = createSignal<Coords | null>(null);
  const [win, setWin] = createSignal(false);
  const cities = data["data"] as City[];

  // Local storage
  const expiration = dayjs().endOf("day").toDate();
  const noCities = { cities: [] as string[], expiration };
  const [storedGuesses, storeGuesses] = useLocalStorage<typeof noCities>(
    "guesses",
    { ...noCities }
  );
  const [storedStats, storeStats] = useLocalStorage<Stats>(
    "statistics",
    firstStats
  );

  const restoredGuesses = () => {
    console.log("Restoring guesses.");
    return storedGuesses()
      .cities.map((cityName, idx) => {
        const city = cities.find((c) => c.city_ascii === cityName);
        return { city, order: idx };
      })
      .filter((guess) => Boolean(guess.city)) as Guess[];
  };

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

  onMount(() => {
    console.log("Mounting game");
  });

  // Stores guesses when new guess added
  // TODO guesses not resetting on globle??
  onMount(() => {
    if (storedGuesses().cities.length === 0) {
      setGuesses({ cities: [] });
      return;
    }
    if (win()) setTimeout(() => setShowStats(true), 2000);
  });

  // Resets guesses when stored guesses expired
  createEffect(() => {
    const storable = guesses.cities.map((guess) => guess.city.city_ascii);
    storeGuesses({
      cities: storable,
      expiration,
    });
  });

  // When the player wins!
  createEffect(
    on(win, () => {
      const today = dayjs();
      // const lastWin
      // const previousWin = storedStats().lastWin;
      const lastWin = dayjs(storedStats().lastWin);
      if (win() && lastWin.isBefore(today, "date")) {
        // Store new stats in local storage
        const lastWin = today;
        const gamesWon = storedStats().gamesWon + 1;
        // const streakBroken = dateDiffInDays(storedStats().lastWin, lastWin) > 1;
        const streakBroken = lastWin.diff(today, "date") > 1;
        const currentStreak = streakBroken
          ? 1
          : storedStats().currentStreak + 1;
        const maxStreak =
          currentStreak > storedStats().maxStreak
            ? currentStreak
            : storedStats().maxStreak;
        const usedGuesses = [...storedStats().usedGuesses, guesses.numGuesses];
        const emojiGuesses = "";
        // const chunks = [];
        // for (let i = 0; i < guesses.numGuesses; i += 8) {
        //   chunks.push(guesses.cities.slice(i, i + 8));
        // }
        // const emojiGuesses = chunks
        //   .map((each) =>
        //     each
        //       .map((guess) => getColourEmoji(guess, guesses[guesses.length - 1]))
        //       .join("")
        //   )
        //   .join("\n");
        const newStats = {
          lastWin: lastWin.toString(),
          gamesWon,
          currentStreak,
          maxStreak,
          usedGuesses,
          emojiGuesses,
        };
        storeStats(newStats);

        // Show stats
        setTimeout(() => setShowStats(true), 2000);
      }
    })
  );

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
