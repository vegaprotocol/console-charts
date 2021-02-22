import { Colors } from "../lib/vega-colours";
import { Element } from "../types/element";

export function addGridPath(
  ctx: CanvasRenderingContext2D,
  xScale: any,
  yScale: any
) {
  const xRange = xScale.range().map(Math.round);
  const yRange = yScale.range().map(Math.round);

  const numXTicks = (xRange[1] - xRange[0]) / 50;
  const numYTicks = Math.abs(yRange[1] - yRange[0]) / 50;

  const xTicks = xScale.ticks(numXTicks);
  const yTicks = yScale.ticks(numYTicks);

  for (const tick of xTicks) {
    ctx.save();
    ctx.beginPath();

    ctx.strokeStyle = Colors.GRAY;
    ctx.fillStyle = "transparent";
    ctx.lineWidth = 0.7;

    ctx.moveTo(Math.round(xScale(tick)), yRange[0]);
    ctx.lineTo(Math.round(xScale(tick)), yRange[1]);

    ctx.fill();
    ctx.stroke();

    ctx.closePath();
    ctx.restore();
  }

  for (const tick of yTicks) {
    ctx.save();
    ctx.beginPath();

    ctx.strokeStyle = Colors.GRAY;
    ctx.fillStyle = "transparent";
    ctx.lineWidth = 1;

    ctx.moveTo(xRange[0], Math.round(yScale(tick)) + 0.5);
    ctx.lineTo(xRange[1], Math.round(yScale(tick)) + 0.5);

    ctx.fill();
    ctx.stroke();

    ctx.closePath();
    ctx.restore();
  }
}

export class GridElement implements Element {
  draw(ctx: CanvasRenderingContext2D, xScale: any, yScale: any) {
    addGridPath(ctx, xScale, yScale);
  }
}
