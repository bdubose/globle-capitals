import { lazy, Suspense } from "solid-js";

// import NavGlobe from "../components/globes/NavGlobe";
const NavGlobe = lazy(() => import("../components/globes/NavGlobe"));

export default function () {
  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <NavGlobe />
      </Suspense>
    </div>
  );
}
