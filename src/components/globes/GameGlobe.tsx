import Globe from "globe.gl";
import { createEffect, createSignal, onMount, Show } from "solid-js";
import { UAParser } from "ua-parser-js";
import { globeImg } from "../../util/globe";
import data from "../../data/filter_cities.json";
import { SetStoreFunction } from "solid-js/store";

type Props = {
  // setGuesses: SetStoreFunction<Guess[]>;
  guesses: Guess[];
};

export default function ({ guesses }: Props) {
  // const cities = guesses.map((guess) => guess.city);

  const colourMap = {
    Asia: "yellow",
    Europe: "purple",
    Africa: "brown",
    "North America": "red",
    "South America": "green",
    Oceania: "blue",
    None: "white",
  };

  const cityPoints = () =>
    guesses.map(({ city }) => {
      const continent = (city.continent || "None") as Continent;
      return {
        ...city,
        label: `<b class="text-black bg-pink-100 p-1">${city.city}</b>`,
        color: colourMap[continent],
      };
    });

  let globeRef: HTMLDivElement | undefined;
  const globe = Globe();

  // Not sure how to make the globe reactive. In react, I could set the
  // properties as states and change them with React, but can't do that
  // here

  // 1. Re-render the globe?
  // 2. Invent some kind of SolidJs binding?
  // 3. Initialize the globe with predefined functions?

  // Nevermind I have an instance of the globe to work with :)
  //

  // Signals
  const [isLoaded, setIsLoaded] = createSignal(false);

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
    const points = cityPoints();
    console.log(points);
    globe.pointsData(cityPoints());
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
