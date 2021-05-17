import { RenderableElement, ScaleLinear, ScaleTime } from "../types";

import { align, alignSpan, Colors } from "../helpers";

function addCrosshairPath(
  ctx: CanvasRenderingContext2D,
  xScale: ScaleTime,
  yScale: ScaleLinear,
  pixelRatio: number,
  position: [Date | null, number | null]
) {
  const xRange = xScale.range().map(Math.round);
  const yRange = yScale.range().map(Math.round);

  ctx.save();

  ctx.setLineDash([4, 6]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = Colors.WHITE;
  ctx.lineWidth = 1 / pixelRatio;
  ctx.lineCap = "square";

  if (position[0]) {
    const x = xScale(position[0]);

    ctx.beginPath();
    ctx.moveTo(align(x, pixelRatio), align(yRange[0], pixelRatio));
    ctx.lineTo(align(x, pixelRatio), align(yRange[1], pixelRatio));
    ctx.stroke();
    ctx.closePath();
  }

  if (position[1]) {
    const y = yScale(position[1]);

    ctx.beginPath();
    ctx.moveTo(align(xRange[0], pixelRatio), align(y, pixelRatio));
    ctx.lineTo(align(xRange[1], pixelRatio), align(y, pixelRatio));
    ctx.stroke();
    ctx.closePath();
  }

  ctx.restore();
}

export class CrosshairElement implements RenderableElement {
  draw(
    ctx: CanvasRenderingContext2D,
    xScale: ScaleTime,
    yScale: ScaleLinear,
    pixelRatio: number = 1,
    position: [Date | null, number | null]
  ) {
    addCrosshairPath(ctx, xScale, yScale, pixelRatio, position);
  }
}
