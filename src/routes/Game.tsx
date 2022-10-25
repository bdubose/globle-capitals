import { createSignal, lazy, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import Guesser from "../components/Guesser";

// import NavGlobe from "../components/globes/NavGlobe";
const GameGlobe = lazy(() => import("../components/globes/GameGlobe"));

export default function () {
  const [guesses, setGuesses] = createStore<Guess[]>([]);

  // If I need a getter
  // const [guesses, setGuesses] = createStore({
  //   guesses: [] as Guess[],
  // });
  return (
    <div>
      <p>Top text</p>
      <Guesser setGuesses={setGuesses} guesses={guesses} />
      <Suspense fallback={<p>Loading...</p>}>
        <GameGlobe guesses={guesses} />
      </Suspense>
      <p>Bottom text</p>
    </div>
  );
}
