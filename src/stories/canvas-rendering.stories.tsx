import "../d3fc-element";

import { Meta, Story } from "@storybook/react";
import { scaleLinear, scaleTime } from "d3-scale";
import { useEffect, useRef } from "react";

import { BarElement } from "../elements";
import { FcElement } from "../types";
import { select } from "d3-selection";

export default {
  title: "Elements/Pixel perfection",
} as Meta;

const bar = new BarElement({
  x: new Date(2020, 1, 11, 12),
  y: 103,
  width: 1000 * 60 * 60 * 24 * 0.5,
  height: 4,
  fill: "black",
  stroke: "white",
});

const xScale = scaleTime().domain([new Date(2020, 1, 1), new Date(2020, 2, 1)]);
const yScale = scaleLinear().domain([0, 400]);

export const PixelPerfectCandles: Story = () => {
  const ref = useRef<FcElement>(null!);
  const zoomRef = useRef<HTMLCanvasElement>(null!);

  useEffect(() => {
    const container = select<FcElement, unknown>(ref.current)
      .on("measure", (event) => {
        const { width, height } = event.detail;
        xScale.range([0, width]);
        yScale.range([height, 0]);
      })
      .on("draw", (event) => {
        const ctx = select(event.currentTarget)
          .select<HTMLCanvasElement>("canvas")
          .node()
          ?.getContext("2d");

        const pixelRatio = event.detail.pixelRatio;

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.scale(1, 1);
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, pixelRatio * 400, pixelRatio * 400);

          ctx.strokeStyle = "yellow";
          ctx.lineWidth = 2;
          ctx.strokeRect(280, 590, 200, 100);

          bar.draw(ctx, xScale, yScale, pixelRatio);

          const zoomCtx = zoomRef.current.getContext("2d");

          if (zoomCtx) {
            zoomCtx.imageSmoothingEnabled = false;

            zoomCtx?.drawImage(ctx.canvas, 280, 590, 50, 50, 0, 0, 800, 800);
          }
        }
      });

    ref.current.requestRedraw();
  }, []);

  return (
    <div>
      <d3fc-canvas
        ref={ref}
        style={{ width: "400px", height: "400px" }}
        use-device-pixel-ratio
      ></d3fc-canvas>
      <canvas
        ref={zoomRef}
        width={400}
        height={400}
        style={{ width: "400px", height: "400px", imageRendering: "pixelated" }}
      ></canvas>
    </div>
  );
};
