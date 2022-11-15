import { createEffect, createSignal, lazy, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { computeDistanceBetween } from "spherical-geometry-js";
import Guesser from "../components/Guesser";
import List from "../components/List";
import { createPracticeAns, getPracticeAns } from "../util/practice";
import Prompt from "../components/Prompt";
import { A } from "@solidjs/router";

const GameGlobe = lazy(() => import("../components/globes/GameGlobe"));

export default function () {
  // Signals
  const [pov, setPov] = createSignal<Coords | null>(null);
  const [win, setWin] = createSignal(false);
  const [showPrompt, setShowPrompt] = createSignal(false);
  const [ans, setAns] = createSignal(getPracticeAns());
  const [showGlobe, setShowGlobe] = createSignal(true);

  // Stores
  const [guesses, setGuesses] = createStore({
    cities: [] as City[],
    get sortedGuesses() {
      const copy = [...this.cities];
      return copy.sort((a, z) => {
        const proximityA = computeDistanceBetween(a, ans());
        const proximityB = computeDistanceBetween(z, ans());
        return proximityA - proximityB;
      });
    },
    get numGuesses() {
      return this.cities.length;
    },
    get closest() {
      if (this.cities.length === 0) return 0;
      const closestCity = this.sortedGuesses[0];
      return computeDistanceBetween(closestCity, ans());
    },
  });

  // Effects
  createEffect(() => {
    const winningGuess = guesses.cities.find((city) => city.id === ans().id);
    if (winningGuess) {
      setWin(true);
      setTimeout(() => setShowPrompt(true), 2000);
    }
  });

  // New game
  function newGame() {
    setGuesses("cities", []);
    setWin(false);
    setShowGlobe(false);
    setAns(createPracticeAns());
    setTimeout(() => setShowGlobe(true), 2000);
  }

  return (
    <div>
      <Show when={showGlobe()} keyed fallback={<p>Loading...</p>}>
        <>
          <p class="italic">You are currently in Practice Mode.</p>
          <Guesser
            setGuesses={setGuesses}
            guesses={guesses}
            win={win}
            ans={ans()}
          />
          <Suspense fallback={<p>Loading...</p>}>
            <GameGlobe guesses={guesses} pov={pov} ans={ans()} />
          </Suspense>
        </>
      </Show>
      <List guesses={guesses} setPov={setPov} />
      <A href="/">
        <button
          class="bg-blue-700 dark:bg-purple-800 hover:bg-blue-900
              dark:hover:bg-purple-900 disabled:bg-blue-900  text-white 
             focus:ring-4 focus:ring-blue-300 rounded-lg text-sm
             px-4 py-2.5 text-center w-max"
        >
          End Practice Mode
        </button>
      </A>
      <Prompt
        promptType="Choice"
        text="Play again?"
        showPrompt={showPrompt}
        setShowPrompt={setShowPrompt}
        yes={newGame}
      />
    </div>
  );
}