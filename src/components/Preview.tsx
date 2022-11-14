import { onMount } from "solid-js";
import * as d3 from "d3";
import { interpolateTurbo, scaleSequential } from "d3";
import { globePreviewImg } from "../util/globe";
import UAParser from "ua-parser-js";
import { getContext } from "../Context";

type City = {
  name: string;
  x: number;
  y: number;
};

export default function () {
  const { theme } = getContext();
  let svg: SVGSVGElement;
  const parser = new UAParser();
  const isMobile = parser.getDevice().type === "mobile";
  const convertMobile = (num: number) => (num * 7) / 12;
  const width = isMobile ? 350 : 600;
  const height = isMobile ? convertMobile(250) : 250;

  let points = [
    { name: "Ottawa", x: 170, y: 55 },
    { name: "Tokyo", x: 520, y: 90 },
    { name: "Pretoria", x: 340, y: 190 },
    { name: "Brasilia", x: 225, y: 168 },
    { name: "Cairo", x: 343, y: 90 },
  ] as City[];

  if (isMobile) {
    points = points.map((p) => {
      return { name: p.name, x: convertMobile(p.x), y: convertMobile(p.y) };
    });
  }

  const endPoint = points[points.length - 1];

  const distance = (p1: City, p2: City) =>
    Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

  const control = (p: City) => distance(p, endPoint) / 3;

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
    const colourScale = scaleSequential(interpolateTurbo).domain([0.8, 0]);
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

    // d3.text()

    const textWidths = [] as number[];

    const texts = d3
      .select(svg)
      .selectAll("text")
      .data(points)
      .enter()
      .append("text")
      .attr("opacity", 0)
      .attr("font-size", 12)
      .attr("font-weight", "bold")
      .text((d) => d.name)
      .each(function (d, i) {
        textWidths.push(this.getComputedTextLength());
      })
      .attr("x", (d, i) => d.x - textWidths[i] / 2)
      .attr("y", (d, i) => (isMobile ? d.y - 15 : d.y - 20));

    const rects = d3
      .select(svg)
      .selectAll("rect")
      .data(points)
      .enter()
      .append("rect")
      .attr("x", (d, i) => d.x - (textWidths[i] + 10) / 2)
      .attr("y", (d, i) => (isMobile ? d.y - 30 : d.y - 40))
      .attr("width", (d, i) => textWidths[i] + 10)
      .attr("height", isMobile ? 20 : 30)
      .attr("opacity", 0)
      .attr("fill", theme().isDark ? "#F3E2F1" : "#FEFCE8");

    const circles = d3
      .select(svg)
      .selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", (d, i) => d.x)
      .attr("cy", (d, i) => d.y)
      .attr("r", 10)
      .attr("opacity", 0)
      // .attr("width", (d) => d.width)
      // .attr("height", 30)
      // .attr("opacity", 0)
      .attr("fill", "url(#gradient)");
    // .text((d) => d.name);

    const quadratics = pathData.map((data) => {
      const path = d3.path();
      const { p1, p2, bcp } = data;
      path.moveTo(p1.x, p1.y);
      path.bezierCurveTo(bcp[0].x, bcp[0].y, bcp[1].x, bcp[1].y, p2.x, p2.y);
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

    const rectNodes = rects.nodes();
    const textNodes = texts.nodes();
    const pathNodes = paths.nodes();
    const circleNodes = circles.nodes();

    function animateLabel(idx: number) {
      const rectNode = rectNodes[idx];
      const textNode = textNodes[idx];
      const circNode = circleNodes[idx];

      d3.select(textNode)
        .raise()
        .attr("opacity", 0)
        .transition()
        .attr("opacity", 1)
        .duration(1000);

      d3.select(circNode)
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
          if (idx === 0) return animateLabel(idx + 1);
          animatePath(idx - 1);
        });
    }

    function animatePath(idx: number) {
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
        .on("end", () => animateLabel(idx + 2));
    }

    animateLabel(0);
  });

  return (
    <div class="relative my-4 mx-auto mix-blend-saturation w-fit">
      <div
        style={{
          position: "absolute",
          background: `url(${globePreviewImg()}) 0% 0% / ${width}px ${
            height + 50
          }px no-repeat`,
          width: width + "px",
          height: height + "px",
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
