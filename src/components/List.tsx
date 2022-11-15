import {
  createEffect,
  createSignal,
  For,
  Match,
  Setter,
  Show,
  Switch,
} from "solid-js";
import { getContext } from "../Context";
import Toggle from "./Toggle";

type Props = {
  guesses: GuessStore;
  setPov: Setter<Coords>;
};

export function formatKm(m: number) {
  const BIN = 10;
  const unitMap: Record<Unit, number> = {
    km: 1000,
    miles: 1609.34,
  };
  const context = getContext();
  const value = m / unitMap[context.distanceUnit().unit];
  if (value < BIN) return "< " + BIN;
  const rounded = Math.round(value / BIN) * BIN;
  const format = (num: number) =>
    num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${format(rounded)}`;
}

export default function ({ guesses, setPov }: Props) {
  const context = getContext();
  const [isSortedByDistance, toggleSortByDistance] = createSignal(true);

  const sortedGuesses = () => {
    if (isSortedByDistance()) {
      return guesses.sortedGuesses;
    } else {
      return guesses.cities;
    }
  };

  const isAlreadyShowingKm = context.distanceUnit().unit === "km";
  const [isShowingKm, setShowingKm] = createSignal(isAlreadyShowingKm);
  createEffect(() =>
    context.setDistanceUnit({ unit: isShowingKm() ? "km" : "miles" })
  );

  return (
    <div class="py-8 dark:text-white z-30 mb-20">
      <Switch fallback={<p>Guesses will appear here.</p>}>
        <Match when={guesses.numGuesses < 1}>
          <p>Guesses will appear here.</p>
        </Match>
        <Match when={isSortedByDistance()}>
          <p>Closest</p>
        </Match>
        <Match when={!isSortedByDistance()}>
          <p>Guessed</p>
        </Match>
      </Switch>
      <ul class="grid grid-cols-3 md:grid-cols-4 gap-3">
        <For each={sortedGuesses()}>
          {(city) => {
            const flagProp = city.iso2.toLowerCase();
            return (
              <li>
                <button
                  onClick={() => setPov(city)}
                  class="flex items-center cursor-pointer"
                >
                  <img
                    src={`https://flagcdn.com/w20/${flagProp}.png`}
                    alt={city.city_ascii}
                  />
                  <span class="ml-2 text-md text-left">{city.city_ascii}</span>
                </button>
              </li>
            );
          }}
        </For>
      </ul>
      <Show when={guesses.numGuesses > 0}>
        <div class="mt-8">
          <div class="flex items-center space-x-1">
            <p>Closest city: {formatKm(guesses.closest)}</p>
            <Toggle
              setToggle={setShowingKm}
              toggleProp={isShowingKm}
              on="km"
              off="miles"
            />
          </div>
          <p>
            <button
              onClick={() => toggleSortByDistance(!isSortedByDistance())}
              class="mt-2"
            >
              <Switch>
                <Match when={isSortedByDistance()}>
                  <span class="text-md underline">Sort by guesses</span>
                </Match>
                <Match when={!isSortedByDistance()}>
                  <span class="text-md underline">Sort by distance</span>
                </Match>
              </Switch>
            </button>
          </p>
        </div>
      </Show>
    </div>
  );
}
