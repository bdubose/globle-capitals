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
import Guesser from "../components/Guesser";
import List from "../components/List";
import data from "../data/answers.json";
import { getAnswer } from "../util/encryption";
import { emojiString } from "../util/emojis";
import { getContext } from "../Context";

const GameGlobe = lazy(() => import("../components/globes/GameGlobe"));

type Props = {
  setShowStats: Setter<boolean>;
};

export default function (props: Props) {
  // Signals
  const context = getContext();
  const [pov, setPov] = createSignal<Coords | null>(null);

  const lastWin = dayjs(context.storedStats().lastWin);
  const [win, setWin] = createSignal(lastWin.isSame(dayjs(), "date"));

  const cities = data.filter(({ capital }) => capital === "primary") as City[];
  const [ans] = createResource(getAnswer);

  const restoredGuesses = () => {
    return context.storedGuesses().cities.map((cityName, idx) => {
      const city = cities.find((c) => c.city_ascii === cityName);
      return city;
    }) as City[];
  };

  // Effects
  createEffect(() => {
    const winningGuess = restoredGuesses().find(
      (city) => city?.id === ans()?.id
    );
    if (winningGuess) setWin(true);
  });

  onMount(() => {
    const expiration = dayjs(context.storedGuesses().expiration);
    if (dayjs().isAfter(expiration)) context.resetGuesses();
    if (win()) setTimeout(() => props.setShowStats(true), 3000);
  });

  // When the player wins!
  createEffect(
    on(win, () => {
      const today = dayjs();
      const lastWin = dayjs(context.storedStats().lastWin);
      if (win() && lastWin.isBefore(today, "date")) {
        // Store new stats in local storage
        const gamesWon = context.storedStats().gamesWon + 1;
        const streakBroken = !dayjs()
          .subtract(1, "day")
          .isSame(lastWin, "date");
        console.log("last win", context.storedStats().lastWin);
        console.log("last win", lastWin.toDate());
        console.log("today", today.toDate());
        console.log("streak broken", streakBroken);
        const currentStreak = streakBroken
          ? 1
          : context.storedStats().currentStreak + 1;
        const maxStreak =
          currentStreak > context.storedStats().maxStreak
            ? currentStreak
            : context.storedStats().maxStreak;
        const usedGuesses = [
          ...context.storedStats().usedGuesses,
          context.storedGuesses().cities.length,
        ];
        const emojiGuesses = emojiString(restoredGuesses(), ans());
        const newStats = {
          lastWin: today.toString(),
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

  function updateLocalStorage(newCity: City) {
    const cityName = newCity.city_ascii;
    context.storeGuesses((prev) => {
      return { ...prev, cities: [...prev.cities, cityName] };
    });
  }

  return (
    <div>
      <Show when={ans()} keyed>
        {(ans) => {
          return (
            <>
              <Guesser
                addGuess={updateLocalStorage}
                guesses={restoredGuesses}
                win={win}
                ans={ans}
              />
              <Suspense fallback={<p>Loading...</p>}>
                <GameGlobe guesses={restoredGuesses} pov={pov} ans={ans} />
              </Suspense>
              <List guesses={restoredGuesses} setPov={setPov} ans={ans} />
            </>
          );
        }}
      </Show>
    </div>
  );
}
