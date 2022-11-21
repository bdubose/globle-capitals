import Globe from "globe.gl";
import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import dayImg from "../../images/earth-day-min.webp";
import nightImg from "../../images/earth-night-min.webp";
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
        // .globeImageUrl(globeImg(props))
        .globeImageUrl(props?.isDark ? nightImg : dayImg)
        .backgroundColor("#00000000")
        .enablePointerInteraction(false)
        .showAtmosphere(false)
        .showGlobe(false)
        .width(100)
        .height(100)(globeRef);

      const controls = globe.controls() as any;
      globe.pointOfView({ lat: 0, lng: 0, altitude: 1.5 });
      // globe.pauseAnimation();
      controls.autoRotate = true;

      // setTimeout(() => globe.resumeAnimation(), 1000);
      setTimeout(() => globe.showGlobe(true), 1000);
    }
  });

  return (
    <div class="w-fit mx-auto cursor-pointer" onClick={() => navigate("/game")}>
      <div ref={globeRef!} class="w-fit mx-auto my-2" />
      <b>{isMobile ? "Tap" : "Click"} the globe to play!</b>
    </div>
  );
}
