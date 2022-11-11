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
import data from "../data/answers.json";
import { setShowStats } from "../App";
import { getAnswer } from "../util/encryption";
import {
  storedGuesses,
  storeGuesses,
  storedStats,
  storeStats,
} from "../util/globalState";
import { emojiString } from "../util/emojis";

const GameGlobe = lazy(() => import("../components/globes/GameGlobe"));

export default function () {
  // Signals
  const [pov, setPov] = createSignal<Coords | null>(null);
  const [win, setWin] = createSignal(false);
  const cities = data["data"] as City[];
  const [ans] = createResource(getAnswer);

  const restoredGuesses = () => {
    return storedGuesses().cities.map((cityName, idx) => {
      const city = cities.find((c) => c.city_ascii === cityName);
      return city;
    });
  };

  // Stores
  const [guesses, setGuesses] = createStore({
    cities: restoredGuesses() as City[],
    get sortedGuesses() {
      const copy = [...this.cities];
      // if (!ans()) return []
      return copy.sort((a, z) => {
        const proximityA = computeDistanceBetween(a, ans() || a);
        const proximityB = computeDistanceBetween(z, ans() || z);
        return proximityA - proximityB;
      });
    },
    get numGuesses() {
      return this.cities.length;
    },
    get closest() {
      const closestCity = this.sortedGuesses[0];
      return computeDistanceBetween(closestCity, ans() || closestCity);
    },
  });

  // Effects
  createEffect(() => {
    const winningGuess = guesses.cities.find((city) => city.id === ans()?.id);
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
    const storable = guesses.cities.map((guess) => guess.city_ascii);
    storeGuesses({
      cities: storable,
      expiration: dayjs().endOf("day").toDate(),
    });
  });

  // When the player wins!
  createEffect(
    on(win, () => {
      const today = dayjs();
      const lastWin = dayjs(storedStats().lastWin);
      if (win() && lastWin.isBefore(today, "date")) {
        // Store new stats in local storage
        const lastWin = today;
        const gamesWon = storedStats().gamesWon + 1;
        const streakBroken = lastWin.diff(today, "date") > 1;
        const currentStreak = streakBroken
          ? 1
          : storedStats().currentStreak + 1;
        const maxStreak =
          currentStreak > storedStats().maxStreak
            ? currentStreak
            : storedStats().maxStreak;
        const usedGuesses = [...storedStats().usedGuesses, guesses.numGuesses];
        const emojiGuesses = emojiString(guesses.cities, ans());
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
