import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const DecisionBoundaryPlot = ({
  data,
  width = 600,
  height = 400,
  className,
}) => {
  const ref = useRef();

  useEffect(() => {
    if (data) {
      drawPlot(data);
    }
  }, [data]);

  const drawPlot = (data) => {
    d3.select(ref.current).selectAll("svg").remove(); // Clear previous SVG
    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3
      .scaleLinear()
      .domain([
        d3.min(data.points, (d) => d.x) - 1,
        d3.max(data.points, (d) => d.x) + 1,
      ])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data.points, (d) => d.y) - 1,
        d3.max(data.points, (d) => d.y) + 1,
      ])
      .range([innerHeight, 0]);

    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([1, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Heatmap
    g.selectAll(".tile")
      .data(data.grid)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.x))
      .attr("y", (d) => yScale(d.y))
      .attr("width", innerWidth / Math.sqrt(data.grid.length)) // assuming square grid
      .attr("height", innerHeight / Math.sqrt(data.grid.length))
      .attr("fill", (d) => colorScale(d.prob));

    // Scatter points
    g.selectAll(".point")
      .data(data.points)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 3)
      .attr("fill", (d) => (d.class === 0 ? "blue" : "orange"));

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g").call(d3.axisLeft(yScale));
  };

  return <div ref={ref} className={className}></div>;
};
export default DecisionBoundaryPlot;
