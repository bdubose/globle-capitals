import { scaleLinear, scaleSequential } from "d3-scale";
import { interpolateTurbo } from "d3-scale-chromatic";
import {
  computeDistanceBetween,
  computeHeading,
  computeOffset,
} from "spherical-geometry-js";
import { MAX_DISTANCE } from "./constants";
import data from "../data/filter_cities.json";

export function arcGradient(a1: Coords, a2: Coords, ans: Coords) {
  // Colours
  const gradient = interpolateTurbo;
  const colorScale = scaleSequential(gradient).domain([MAX_DISTANCE, 0]);

  // Geometry
  const arcLength = computeDistanceBetween(a1, a2);
  const heading = computeHeading(a1, a2);

  // Return function that gets colour from fraction on arc
  const getOffsetCoords = (frac: number) => {
    const offset = computeOffset(a1, arcLength * frac, heading);
    const proximity = computeDistanceBetween(offset, ans);
    const color = colorScale(proximity);
    return color;
  };
  return getOffsetCoords;
}

export function getCitySize(pop: number) {
  const cities = data["data"] as City[];
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
