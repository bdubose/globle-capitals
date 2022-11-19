import Globe from "globe.gl";
import { onMount } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { globeImg } from "../../util/globe";
import UAParser from "ua-parser-js";

type Props = {
  isDark?: boolean;
};

export default function (props?: Props) {
  let globeRef: HTMLDivElement | undefined;
  const globe = Globe();
  const parser = new UAParser();
  const isMobile = parser.getDevice().type === "mobile";
  const navigate = useNavigate();

  onMount(() => {
    if (globeRef) {
      globe
        .globeImageUrl(globeImg(props))
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
    <div class="w-fit mx-auto" onClick={() => navigate("/game")}>
      <div ref={globeRef!} class="w-fit mx-auto my-2" />
      <b>{isMobile ? "Tap" : "Click"} the globe to play!</b>
    </div>
  );
}
