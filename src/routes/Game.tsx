import dayjs from "dayjs";
import {
  createEffect,
  createResource,
  createSignal,
  lazy,
  on,
  onMount,
  Setter,
  Show,
  Suspense,
} from "solid-js";
import { createStore } from "solid-js/store";
import { computeDistanceBetween } from "spherical-geometry-js";
import Guesser from "../components/Guesser";
import List from "../components/List";
import data from "../data/answers.json";
import { getAnswer } from "../util/encryption";
import { emojiString } from "../util/emojis";
import { useGlobalStateContext } from "../Context";

const GameGlobe = lazy(() => import("../components/globes/GameGlobe"));

type Props = {
  setShowStats: Setter<boolean>;
};

export default function (props: Props) {
  // Signals
  const context = useGlobalStateContext();
  const [pov, setPov] = createSignal<Coords | null>(null);

  const lastWin = dayjs(context.storedStats().lastWin);
  const [win, setWin] = createSignal(lastWin.isSame(dayjs(), "date"));

  const cities = data["data"] as City[];
  const [ans] = createResource(getAnswer);

  const restoredGuesses = () => {
    return context.storedGuesses().cities.map((cityName, idx) => {
      const city = cities.find((c) => c.city_ascii === cityName);
      return city;
    });
  };

  // Stores
  const [guesses, setGuesses] = createStore({
    cities: restoredGuesses() as City[],
    get sortedGuesses() {
      const copy = [...this.cities];
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
    console.log("Mounting game");
    if (context.storedGuesses().cities.length === 0) {
      setGuesses({ cities: [] });
      return;
    }
    if (win()) setTimeout(() => props.setShowStats(true), 3000);
  });

  // Resets guesses when stored guesses expired
  createEffect(() => {
    const storable = guesses.cities.map((guess) => guess.city_ascii);
    context.storeGuesses({
      cities: storable,
      expiration: dayjs().endOf("day").toDate(),
    });
  });

  // When the player wins!
  createEffect(
    on(win, () => {
      const today = dayjs();
      const lastWin = dayjs(context.storedStats().lastWin);
      if (win() && lastWin.isBefore(today, "date")) {
        // Store new stats in local storage
        const lastWin = today;
        const gamesWon = context.storedStats().gamesWon + 1;
        const streakBroken = lastWin.diff(today, "date") > 1;
        const currentStreak = streakBroken
          ? 1
          : context.storedStats().currentStreak + 1;
        const maxStreak =
          currentStreak > context.storedStats().maxStreak
            ? currentStreak
            : context.storedStats().maxStreak;
        const usedGuesses = [
          ...context.storedStats().usedGuesses,
          guesses.numGuesses,
        ];
        const emojiGuesses = emojiString(guesses.cities, ans());
        const newStats = {
          lastWin: lastWin.toString(),
          gamesWon,
          currentStreak,
          maxStreak,
          usedGuesses,
          emojiGuesses,
        };
        context.storeStats(newStats);

        // Show stats
        setTimeout(() => props.setShowStats(true), 2000);
      }
    })
  );

  return (
    <div>
      <Show when={ans()} keyed>
        {(ans) => {
          return (
            <>
              <Guesser
                setGuesses={setGuesses}
                guesses={guesses}
                win={win}
                ans={ans}
              />
              <Suspense fallback={<p>Loading...</p>}>
                <GameGlobe guesses={guesses} pov={pov} ans={ans} />
              </Suspense>
            </>
          );
        }}
      </Show>
      <List guesses={guesses} setPov={setPov} />
    </div>
  );
}
