import { scaleSequential } from "d3-scale";
import { interpolateTurbo } from "d3-scale-chromatic";
import {
  computeDistanceBetween,
  computeHeading,
  computeOffset,
} from "spherical-geometry-js";
import { MAX_DISTANCE } from "./constants";

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
