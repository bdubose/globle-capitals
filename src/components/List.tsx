import { createSignal, For, Match, Setter, Show, Switch } from "solid-js";
import Toggle from "./Toggle";

type Props = {
  guesses: GuessStore;
  setPov: Setter<Coords>;
};

export default function ({ guesses, setPov }: Props) {
  const [isSortedByDistance, toggleSortByDistance] = createSignal(true);
  const [isShowingKm, toggleShowingKm] = createSignal(true);

  const sortedGuesses = () => {
    if (isSortedByDistance()) {
      return guesses.sortedGuesses;
    } else {
      return guesses.cities;
    }
  };

  function formatKm(m: number, isKm: boolean) {
    const METERS_PER_MILE = 1609.34;
    const BIN = 10;
    const value = isKm ? m / 1000 : m / METERS_PER_MILE;
    if (value < BIN) return "< " + BIN;
    const rounded = Math.round(value / BIN) * BIN;
    const format = (num: number) =>
      num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return `~ ${format(rounded)}`;
  }

  return (
    <div class="md:ml-10 md:mr-0 py-8 dark:text-white z-30 mb-20">
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
          {({ city }) => {
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
            <p>Closest border: {formatKm(guesses.closest, isShowingKm())}</p>
            <Toggle
              name="unit-switch"
              setToggle={toggleShowingKm}
              toggle={isShowingKm}
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
