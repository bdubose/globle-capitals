import Globe from "globe.gl";
import { Accessor, createEffect, createSignal, onMount, Show } from "solid-js";
import { UAParser } from "ua-parser-js";
import { globeImg } from "../../util/globe";
import { ans } from "../../util/answer";
import { arcGradient } from "../../util/geometry";

type Props = {
  guesses: GuessStore;
  pov: Accessor<Coords | null>;
};

export default function ({ guesses, pov }: Props) {
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
    guesses.cities.map(({ city }) => {
      const continent = (city.continent || "None") as Continent;
      return {
        lat: city.lat,
        lng: city.lng,
        label: `<b class="text-black bg-pink-100 p-1">${city.city}</b>`,
        color: colourMap[continent],
        // radius:
      };
    });

  function createArc(city1: City, city2: City, isLast: boolean) {
    const gradient = arcGradient(city1, city2, ans);
    const label = `<b class="text-black bg-pink-100 p-1">${city1.city_ascii} to ${city2.city_ascii}</b>`;
    return {
      startLng: city1.lng,
      startLat: city1.lat,
      endLng: city2.lng,
      endLat: city2.lat,
      color: gradient,
      transition: isLast,
      label,
    };
  }

  // Option 1: Arcs between all guesses
  // const arcs = () => {
  //   const { cities } = guesses;
  //   if (cities.length <= 1) return [];
  //   else if (cities.length === 2)
  //     return [createArc(cities[0].city, cities[1].city)];
  //   // All possible combinations
  //   return cities.flatMap(({ city: city1 }, i) => {
  //     return cities.slice(i + 1).map(({ city: city2 }) => {
  //       return createArc(city1, city2);
  //     });
  //   });
  // };

  // Option 2: Arcs between consecutive guesses
  const arcs = () => {
    const { cities } = guesses;
    if (cities.length <= 1) return [];
    else if (cities.length === 2)
      return [createArc(cities[0].city, cities[1].city, true)];
    // All possible combinations
    const a = [];
    for (let i = 0; i < cities.length - 1; i++) {
      const isLast = i === cities.length - 2;
      const arc = createArc(cities[i].city, cities[i + 1].city, isLast);
      a.push(arc);
    }
    return a;
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

  // TODO arcs to animate from start to end

  // Effects
  onMount(() => {
    if (globeRef) {
      globe
        .globeImageUrl(globeImg(nightMode))
        .onGlobeReady(() => setIsLoaded(true))
        // .onGlobeClick(() => (controls.autoRotate = false))
        .onGlobeClick(turnGlobe)
        .pointsData(cityPoints())
        .pointAltitude(0.02)
        .pointColor("color")
        .pointLabel("label")
        .pointRadius(0.5)
        .pointsTransitionDuration(0)
        .onPointClick(turnGlobe)
        .labelColor("red")
        .arcColor("color")
        .arcStroke(1.25)
        .arcAltitude(0)

        .arcDashLength(1)
        .arcDashGap(0)
        .arcDashInitialGap("transition")
        .arcDashAnimateTime(300)
        .arcsTransitionDuration(0)

        // .arcDashLength(0.5)
        // .arcDashGap(0)
        // .arcDashAnimateTime(5000)

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

  // When there's a new guess, turn globe to that point
  createEffect(() => {
    if (guesses.numGuesses > 0) {
      const newestPoint = cityPoints()[cityPoints().length - 1];
      const { lat, lng } = newestPoint;
      turnGlobe({ lat, lng });
      globe.pointsData(cityPoints()).arcsData(arcs());
    }
  });

  // When player clicks on a city name, turn to it
  createEffect(() => {
    const newPov = pov();
    if (newPov) turnGlobe(newPov);
  });

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
