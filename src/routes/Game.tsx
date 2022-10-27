import { createSignal, lazy, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { computeDistanceBetween } from "spherical-geometry-js";
import Guesser from "../components/Guesser";
import List from "../components/List";
import { ans } from "../util/answer";

const GameGlobe = lazy(() => import("../components/globes/GameGlobe"));

export default function () {
  const [pov, setPov] = createSignal<Coords>({ lat: 43.7417, lng: -79.3733 });

  const [guesses, setGuesses] = createStore({
    cities: [] as Guess[],
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

  return (
    <div>
      <Guesser setGuesses={setGuesses} guesses={guesses} />
      <Suspense fallback={<p>Loading...</p>}>
        <GameGlobe guesses={guesses} pov={pov} />
      </Suspense>
      <List guesses={guesses} setPov={setPov} />
    </div>
  );
}
