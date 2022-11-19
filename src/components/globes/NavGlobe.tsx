import Globe from "globe.gl";
import { onMount } from "solid-js";
import { A } from "@solidjs/router";
import { globeImg } from "../../util/globe";
import UAParser from "ua-parser-js";

export default function () {
  let globeRef: HTMLDivElement | undefined;
  const globe = Globe();
  const parser = new UAParser();
  const isMobile = parser.getDevice().type === "mobile";

  onMount(() => {
    if (globeRef) {
      globe
        .globeImageUrl(globeImg())
        // .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
        .backgroundColor("#00000000")
        .width(100)
        .height(100)(globeRef);

      const controls = globe.controls() as any;
      globe.pointOfView({ lat: 0, lng: 0, altitude: 1.5 });
      controls.autoRotate = true;
    }
  });

  return (
    <div class="w-fit mx-auto">
      <A href="/game" data-cy="nav-globe">
        <div ref={globeRef!} class="w-fit mx-auto my-2" />
        <b>{isMobile ? "Tap" : "Click"} the globe to play!</b>
      </A>
    </div>
  );
}
