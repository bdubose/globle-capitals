import Globe from "globe.gl";
import { Accessor, createEffect, createSignal, onMount, Show } from "solid-js";
import { UAParser } from "ua-parser-js";
import { globeImg } from "../../util/globe";
import { arcGradient, cityColour, getCitySize } from "../../util/geometry";
import rawCountryData from "../../data/country_data.json";
import { getContext } from "../../Context";

type Props = {
  guesses: GuessStore;
  pov: Accessor<Coords | null>;
  ans: City;
};

export default function ({ guesses, pov, ans }: Props) {
  const countryData = rawCountryData["features"];
  const context = getContext();

  // Refs
  let globeRef: HTMLDivElement | undefined;
  const globe = Globe();

  // Signals
  const [isLoaded, setIsLoaded] = createSignal(false);
  const labelBg = context.theme().isDark ? "#F3E2F1" : "#FEFCE8";

  // Derived signals
  const cityPoints = () =>
    guesses.cities.map((city) => {
      const pointColour = cityColour(city, ans);
      return {
        lat: city.lat,
        lng: city.lng,
        label: `<p 
        class="text-black py-1 px-2 text-center font-bold bg-yellow-50"
        style="background-color: ${labelBg};"
        >${city.city},<br/>${city.country}</p>`,
        color: pointColour,
        radius: getCitySize(city.population),
        element: `<svg>
            <circle cx="1" cy="1" r="${getCitySize(city.population)}" />
          </svg>`,
      };
    });

  const countries = () => {
    return guesses.cities
      .map((city, idx) => {
        const country = countryData.find((country) => {
          return country.properties.NAME === city.country;
        });
        const transition = idx === guesses.numGuesses - 1 ? 400 : 0;
        const output = {
          geometry: country?.geometry,
          colour: "black",
          transition,
        };
        return output;
      })
      .filter(({ geometry }) => Boolean(geometry));
  };

  function createArc(city1: City, city2: City, isLast: boolean) {
    const gradient = arcGradient(city1, city2, ans);
    const label = `<p
    class="text-black py-1 px-2 text-center font-bold bg-yellow-50"
    style="background-color: ${labelBg};"
    >${city1.city_ascii} to ${city2.city_ascii}</p>`;
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

  // Option 2: Arcs between consecutive guesses
  const arcs = () => {
    const { cities } = guesses;
    if (cities.length <= 1) return [];
    else if (cities.length === 2)
      return [createArc(cities[0], cities[1], true)];
    // All possible combinations
    const arcs = [];
    for (let i = 0; i < cities.length - 1; i++) {
      const isLast = i === cities.length - 2;
      const arc = createArc(cities[i], cities[i + 1], isLast);
      arcs.push(arc);
    }
    return arcs;
  };

  // Context params
  const parser = new UAParser();
  const device = parser.getDevice();
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
        .globeImageUrl(globeImg())
        .width(size)
        .height(size)
        .backgroundColor("#00000000")
        .atmosphereColor(
          context.theme().isDark ? "rgba(63, 201, 255)" : "lightskyblue"
        )
        .onGlobeReady(() => setIsLoaded(true))
        .onGlobeClick(turnGlobe)

        .pointAltitude(0.02)
        .pointColor("color")
        .pointLabel("label")
        .pointRadius("radius")
        .pointsTransitionDuration(0)
        .onPointClick(turnGlobe)

        .arcColor("color")
        .arcStroke(1.25)
        .arcAltitude(0)
        .arcDashLength(1)
        .arcDashGap(0)
        .arcDashInitialGap("transition")
        .arcDashAnimateTime(300)
        .arcsTransitionDuration(0)
        .arcLabel("label")

        // .polygonsData(countries())
        .polygonCapColor(() => "transparent")
        .polygonAltitude(0)
        .polygonSideColor("colour")
        .polygonsTransitionDuration(0)
        .polygonStrokeColor("colour")(globeRef);

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
      globe.pointsData(cityPoints()).arcsData(arcs()).polygonsData(countries());
    }
  });

  // When player clicks on a city name, turn to it
  createEffect(() => {
    const newPov = pov();
    if (newPov) turnGlobe(newPov);
  });

  // Clicking the zoom buttons on mobile
  function zoom(z: number) {
    const controls = globe.controls() as any;
    controls.autoRotate = false;
    const coords = globe.pointOfView();
    coords["altitude"] = Math.max(coords.altitude + z, 0.05);
    globe.pointOfView(coords, 250);
  }

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
      <div class="w-full flex justify-between text-md sm:hidden">
        <button
          class=" px-4 border rounded-md select-none dark:bg-[#582679] 
            bg-[#F3BC63] dark:border-[#350a46] border-[#FF8E57]"
          onTouchStart={() => zoom(0.2)}
        >
          -
        </button>
        <button
          class=" px-4 border rounded-md select-none dark:bg-[#582679] 
            bg-[#F3BC63] dark:border-[#350a46] border-[#FF8E57]"
          onTouchStart={() => zoom(-0.2)}
        >
          +
        </button>
      </div>
    </div>
  );
}
