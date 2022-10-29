import Globe from "globe.gl";
import { onMount } from "solid-js";
import { A } from "@solidjs/router";
import { globeImg } from "../../util/globe";

export default function () {
  const nightMode = false;

  let globeRef: HTMLDivElement | undefined;
  const globe = Globe();

  onMount(() => {
    if (globeRef) {
      globe
        .globeImageUrl(globeImg(nightMode))
        // .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
        .backgroundColor("#00000000")
        .width(150)
        .height(150)(globeRef);

      const controls = globe.controls() as any;
      controls.autoRotate = true;
    }
  });

  return (
    <div class="w-fit">
      <A href="game">
        <div ref={globeRef!} class="w-fit mx-0" />
      </A>
    </div>
  );
}
