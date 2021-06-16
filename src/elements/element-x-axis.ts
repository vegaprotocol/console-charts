import { FONT_FAMILY_MONOSPACE, TICK_LABEL_FONT_SIZE } from "../constants";
import { Colors, tickFormat } from "../helpers";
import { getNumXTicks } from "../helpers/helpers-axis";
import { Interval, RenderableElement, ScaleLinear, ScaleTime } from "../types";

function addXAxisPath(
  ctx: CanvasRenderingContext2D,
  xScale: ScaleTime,
  pixelRatio: number,
  interval: Interval
) {
  ctx.strokeStyle = "#fff";

  const xRange = xScale.range();
  const numXTicks = getNumXTicks(xRange[1] - xRange[0]);
  const xTicks = xScale.ticks(numXTicks);
  const xTickLabels = tickFormat(xTicks, interval);

  for (let i = 0; i < xTicks.length; i++) {
    ctx.beginPath();
    ctx.fillStyle = Colors.GRAY_LIGHT;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.font = `${TICK_LABEL_FONT_SIZE}px ${FONT_FAMILY_MONOSPACE}`;
    ctx.fillText(xTickLabels[i], xScale(xTicks[i]), 9);
    ctx.closePath();
  }
}

export class XAxisElement implements RenderableElement {
  draw(
    ctx: CanvasRenderingContext2D,
    xScale: ScaleTime,
    _yScale: ScaleLinear,
    pixelRatio = 1,
    interval: Interval
  ) {
    addXAxisPath(ctx, xScale, pixelRatio, interval);
  }
}
