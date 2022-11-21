import {
  computeDistanceBetween,
  computeHeading,
  computeOffset,
} from "spherical-geometry-js";
import { MAX_DISTANCE } from "./constants";
import data from "../data/answers.json";
import { interpolateTurbo, scaleLinear, scaleSequential } from "d3";

export function arcGradient(a1: Coords, a2: Coords, ans: Coords) {
  // Colours
  const gradient = interpolateTurbo;
  const colourScale = scaleSequential(gradient).domain([MAX_DISTANCE, 0]);

  // Geometry
  const arcLength = computeDistanceBetween(a1, a2);
  const heading = computeHeading(a1, a2);

  // Return function that gets colour from fraction on arc
  const colourMap = (frac: number) => {
    const offset = computeOffset(a1, arcLength * frac, heading);
    const proximity = computeDistanceBetween(offset, ans);
    const colour = colourScale(proximity);
    return colour;
  };
  return colourMap;
}

export function getCitySize(pop: number) {
  const cities = data.filter(({ capital }) => capital === "primary") as City[];
  const populations = cities
    .map((city) => city.population)
    .sort((a, z) => a - z);
  const minPop = populations[0];
  const maxPop = populations[populations.length - 1];
  // Given a value from the domain, returns a number from the range
  const domain = [minPop, maxPop];
  const range = [0.5, 1.5];
  const scale = scaleLinear(domain, range);
  return scale(pop);
}

export function cityColour(city: City, ans: City) {
  if (city.capital !== "primary") return "white";
  const gradient = interpolateTurbo;
  const colourScale = scaleSequential(gradient).domain([MAX_DISTANCE, 0]);
  const proximity = computeDistanceBetween(city, ans);
  const fullColour = colourScale(proximity);
  return fullColour;
}

export const maxColour = scaleSequential(interpolateTurbo)(1);
