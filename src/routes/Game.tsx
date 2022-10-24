import { lazy, Suspense } from "solid-js";

// import NavGlobe from "../components/globes/NavGlobe";
const GameGlobe = lazy(() => import("../components/globes/GameGlobe"));

export default function () {
  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <GameGlobe />
      </Suspense>
    </div>
  );
}
