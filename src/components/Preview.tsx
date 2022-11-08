import { onMount } from "solid-js";
import * as d3 from "d3";
import { interpolateTurbo, scaleSequential } from "d3";
import earth from "../images/earth-day.webp";

// TODO earth picture should maybe be smaller? If it's the exact same pic, next screen might load better
// TODO night earth
// TODO add circles to labels
// TODO font and colour in label should be on theme (and just nicer to look at)

type City = {
  name: string;
  x: number;
  y: number;
  width: number;
};

export default function () {
  let svg: SVGSVGElement;
  const width = 600;
  const height = width / 2;

  const points = [
    { name: "Ottawa", x: 150, y: 90, width: 60 },
    { name: "Tokyo", x: 520, y: 100, width: 52 },
    { name: "Pretoria", x: 310, y: 200, width: 65 },
    { name: "Lima", x: 160, y: 160, width: 47 },
    { name: "Cairo", x: 325, y: 110, width: 47 },
  ] as City[];

  const endPoint = points[points.length - 1];

  const distance = (p1: City, p2: City) =>
    Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

  const control = (p: City) => distance(p, endPoint) / 2.5;

  // const control = 80;
  const up = (p: City) => ({ x: p.x, y: p.y - control(p) });
  const down = (p: City) => ({ x: p.x, y: p.y + control(p) });
  const left = (p: City) => ({ x: p.x - control(p), y: p.y });
  const right = (p: City) => ({ x: p.x + control(p), y: p.y });

  const cubicControlPoints = [
    [up(points[0]), up(points[1])],
    [down(points[1]), right(points[2])],
    [left(points[2]), down(points[3])],
    [up(points[3]), up(points[4])],
  ];

  const pathData = points.map((point, idx) => {
    return {
      p1: point,
      p2: points[idx + 1],
      bcp: cubicControlPoints[idx],
    };
  });
  pathData.pop();

  const range = 50;
  const colours = [...Array(range)].map((_, i) => {
    const colourScale = scaleSequential(interpolateTurbo).domain([0.7, 0]);
    return colourScale(i / range);
  });

  onMount(() => {
    const gradient = d3
      .select(svg)
      .append("defs")
      .append("radialGradient")
      .attr("id", "gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("cx", endPoint.x)
      .attr("cy", endPoint.y);

    gradient
      .selectAll("stop")
      .data(colours)
      .enter()
      .append("stop")
      .attr("offset", function (d, i) {
        return i / (range - 1);
      })
      .attr("stop-color", function (d) {
        return d;
      });

    const rects = d3
      .select(svg)
      .selectAll("rect")
      .data(points)
      .enter()
      .append("rect")
      .attr("x", (d, i) => d.x - 5)
      .attr("y", (d, i) => d.y - 20)
      .attr("width", (d) => d.width)
      .attr("height", 30)
      .attr("opacity", 0)
      .attr("fill", "rgb(254 252 232)")
      .text((d) => d.name);

    const texts = d3
      .select(svg)
      .selectAll("text")
      .data(points)
      .enter()
      .append("text")
      .attr("opacity", 0)
      .attr("x", (d, i) => d.x)
      .attr("y", (d, i) => d.y)
      .text((d) => d.name);

    const quadratics = pathData.map((data) => {
      const path = d3.path();
      const { p1, p2, bcp } = data;
      const x2 = p2.x + p2.width / 2;
      const y2 = p2.y - 5;
      path.moveTo(p1.x + p1.width / 2, p1.y - 5);
      path.bezierCurveTo(bcp[0].x, bcp[0].y, bcp[1].x, bcp[1].y, x2, y2);
      const string = path.toString();
      return { path: string };
    });

    const paths = d3
      .select(svg)
      .selectAll("path")
      .data(quadratics)
      .enter()
      .append("path")
      .attr("stroke", "url(#gradient)")
      .attr("stroke-width", 8)
      .attr("d", (d) => d.path)
      .attr("fill", "none")
      .attr("stroke-dasharray", 1000)
      .attr("stroke-dashoffset", 1000);

    function animateRect(idx: number) {
      const rectNodes = rects.nodes();
      const rectNode = rectNodes[idx];
      const textNodes = texts.nodes();
      const textNode = textNodes[idx];

      d3.select(textNode)
        .attr("opacity", 0)
        .transition()
        .attr("opacity", 1)
        .duration(1000);

      d3.select(rectNode)
        .attr("opacity", 0)
        .transition()
        .attr("opacity", 1)
        .duration(1000)
        .on("end", () => {
          if (idx === 0) return animateRect(idx + 1);
          animatePath(idx - 1);
        });
    }

    function animatePath(idx: number) {
      const pathNodes = paths.nodes();
      if (idx === pathNodes.length) return;
      const pathNode = pathNodes[idx];
      const len = pathNode.getTotalLength() || width;
      d3.select(pathNode)
        .lower()
        .attr("stroke-dasharray", len + " " + len)
        .attr("stroke-dashoffset", len)
        .transition()
        .ease(d3.easeQuadInOut)
        .attr("stroke-dashoffset", 0)
        .duration(1000)
        .on("end", () => animateRect(idx + 2));
    }

    animateRect(0);
  });

  return (
    <div class="relative my-4 mx-auto mix-blend-saturation w-fit">
      <div
        style={{
          position: "absolute",
          background: `url(${earth})`,
          "background-repeat": "no-repeat",
          "background-size": `${width}px ${height}px`,
          width: width + "px",
          height: height + "px",
          filter: "blur(1px)",
        }}
      />
      <svg
        ref={svg!}
        width={width}
        height={height}
        style={{ "backdrop-filter": "blur(0px)" }}
      />
    </div>
  );
}
