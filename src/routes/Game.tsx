import dayjs from "dayjs";
import {
  createEffect,
  createResource,
  createSignal,
  lazy,
  on,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import { createStore } from "solid-js/store";
import { computeDistanceBetween } from "spherical-geometry-js";
import Guesser from "../components/Guesser";
import List from "../components/List";
import data from "../data/filter_cities.json";
import { setShowStats } from "../App";
import { getAnswer } from "../util/encryption";
import {
  storedGuesses,
  storeGuesses,
  storedStats,
  storeStats,
} from "../util/globalState";

const GameGlobe = lazy(() => import("../components/globes/GameGlobe"));

export default function () {
  // Signals
  const [pov, setPov] = createSignal<Coords | null>(null);
  const [win, setWin] = createSignal(false);
  const cities = data["data"] as City[];
  const [ans] = createResource(getAnswer);

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
      // if (!ans()) return []
      return copy.sort((a, z) => {
        const proximityA = computeDistanceBetween(a.city, ans() || a.city);
        const proximityB = computeDistanceBetween(z.city, ans() || z.city);
        return proximityA - proximityB;
      });
    },
    get numGuesses() {
      return this.cities.length;
    },
    get closest() {
      const closestCity = this.sortedGuesses[0];
      return computeDistanceBetween(
        closestCity.city,
        ans() || closestCity.city
      );
    },
  });

  // Effects
  createEffect(() => {
    const winningGuess = guesses.cities.find(
      ({ city }) => city.id === ans()?.id
    );
    if (winningGuess) setWin(true);
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
      expiration: dayjs().endOf("day").toDate(),
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
      <Show when={ans()} keyed>
        {(ans) => {
          return (
            <Suspense fallback={<p>Loading...</p>}>
              <GameGlobe guesses={guesses} pov={pov} ans={ans} />
            </Suspense>
          );
        }}
      </Show>
      <List guesses={guesses} setPov={setPov} />
    </div>
  );
}
