import Globe from "globe.gl";
import { createEffect, createSignal, onMount, Show } from "solid-js";
import { UAParser } from "ua-parser-js";
import { globeImg } from "../../util/globe";
import { ans } from "../../util/answer";
import { arcGradient } from "../../util/geometry";

type Props = {
  // setGuesses: SetStoreFunction<Guess[]>;
  guesses: Guess[];
};

export default function ({ guesses }: Props) {
  // Maps
  const colourMap = {
    Asia: "yellow",
    Europe: "purple",
    Africa: "brown",
    "North America": "red",
    "South America": "green",
    Oceania: "blue",
    None: "white",
  };

  // Refs
  let globeRef: HTMLDivElement | undefined;
  const globe = Globe();

  // Signals
  const [isLoaded, setIsLoaded] = createSignal(false);

  // Derived signals
  const cityPoints = () =>
    guesses.map(({ city }) => {
      const continent = (city.continent || "None") as Continent;
      return {
        lat: city.lat,
        lng: city.lng,
        label: `<b class="text-black bg-pink-100 p-1">${city.city}</b>`,
        color: colourMap[continent],
        // radius:
      };
    });

  function createArc(city1: City, city2: City) {
    const gradient = arcGradient(city1, city2, ans);
    const label = `<b class="text-black bg-pink-100 p-1">${city1.city_ascii} to ${city2.city_ascii}</b>`;
    return {
      startLng: city1.lng,
      startLat: city1.lat,
      endLng: city2.lng,
      endLat: city2.lat,
      color: gradient,
      label,
    };
  }
  const arcs = () => {
    if (guesses.length <= 1) return [];
    else if (guesses.length === 2)
      return [createArc(guesses[0].city, guesses[1].city)];
    // All possible combinations
    return guesses.flatMap(({ city: city1 }, i) => {
      return guesses.slice(i + 1).map(({ city: city2 }) => {
        return createArc(city1, city2);
      });
    });
  };

  // Context params
  const parser = new UAParser();
  const device = parser.getDevice();
  const nightMode = false;
  const size = device.type === "mobile" ? 320 : 600; // px on one side

  // Turn globe on click
  function turnGlobe(coords: {
    lat?: number;
    lng?: number;
    altitude?: number;
  }) {
    const controls = globe.controls() as any;
    controls.autoRotate = false;
    globe.pointOfView(coords, 250);
  }

  // Effects
  onMount(() => {
    if (globeRef) {
      globe
        .globeImageUrl(globeImg(nightMode))
        .onGlobeReady(() => setIsLoaded(true))
        // .onGlobeClick(() => (controls.autoRotate = false))
        .onGlobeClick(turnGlobe)
        .pointsData(cityPoints())
        .pointAltitude(() => 0.02)
        .pointColor("color")
        .pointLabel("label")
        .pointRadius(0.5)
        .pointsTransitionDuration(0)
        .onPointClick(turnGlobe)
        .labelColor(() => "red")
        .arcColor("color")
        .arcStroke(1.5)
        // .arcDashLength(() => 0.75)
        // .arcDashGap(() => 0.1)
        // .arcDashAnimateTime(() => 2500)
        // .arcAltitude(() => 0.05)
        .arcAltitudeAutoScale(0)
        .arcsTransitionDuration(0)
        .arcLabel("label")

        .width(size)
        .height(size)
        .backgroundColor("#00000000")
        .atmosphereColor(nightMode ? "rgba(63, 201, 255)" : "lightskyblue")(
        globeRef
      );

      // Initial settings
      const controls = globe.controls() as any;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1;
      globe.pointOfView({ lat: 0, lng: 0, altitude: 1.5 });
    }
  });

  createEffect(() => {
    if (guesses.length > 0) {
      const newestPoint = cityPoints()[cityPoints().length - 1];
      const { lat, lng } = newestPoint;
      turnGlobe({ lat, lng });
      globe.pointsData(cityPoints()).arcsData(arcs());
    }
  });

  // .pointColor("color")(document.getElementById("globeViz"));

  return (
    <div>
      <Show when={!isLoaded}>
        <p>Loading...</p>
      </Show>
      <div
        ref={globeRef!}
        class="w-min mx-auto 
        select-none decoration-transparent cursor-grab"
        style={{
          "clip-path": `circle(${size / 2}px at ${size / 2}px ${size / 2}px)`,
        }}
      ></div>
    </div>
  );
}
