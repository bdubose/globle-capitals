import { lazy, Suspense } from "solid-js";
import Preview from "../components/Preview";

// import NavGlobe from "../components/globes/NavGlobe";
const NavGlobe = lazy(() => import("../components/globes/NavGlobe"));

export default function () {
  return (
    <div>
      <Preview />
      {/* <Suspense fallback={<p>Loading...</p>}>
        <NavGlobe />
      </Suspense> */}
    </div>
  );
}
