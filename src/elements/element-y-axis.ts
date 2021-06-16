import {
  FONT_FAMILY_MONOSPACE,
  TICK_LABEL_FONT_SIZE,
  Y_AXIS_WIDTH,
} from "../constants";
import { align, Colors, getNumYTicks } from "../helpers";
import { ScaleLinear, ScaleTime } from "../types";
import { RenderableElement } from "../types";

const MARGIN = 6;
const FADE_HEIGHT = 6;

function addYAxisPath(
  ctx: CanvasRenderingContext2D,
  xScale: ScaleTime,
  yScale: ScaleLinear,
  pixelRatio: number
) {
  const xRange = xScale.range();
  const yRange = yScale.range();
  const numYTicks = getNumYTicks(yRange[1] - yRange[0]);
  const yTicks = yScale.ticks(numYTicks);
  const tickFormat = yScale.tickFormat(numYTicks);

  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.6)";

  ctx.fillRect(
    xScale.range()[1] - Y_AXIS_WIDTH,
    yRange[1],
    Y_AXIS_WIDTH,
    yRange[0] - yRange[1]
  );

  ctx.closePath();

  ctx.strokeStyle = "#fff";
  ctx.fillStyle = Colors.GRAY_LIGHT;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = `${TICK_LABEL_FONT_SIZE}px ${FONT_FAMILY_MONOSPACE}`;

  yTicks.forEach(function drawTick(tick: number) {
    ctx.beginPath();

    ctx.fillText(
      tickFormat(tick),
      xRange[1] - Y_AXIS_WIDTH + MARGIN,
      Math.round(yScale(tick))
    );

    ctx.closePath();
  });

  const gradientTop = ctx.createLinearGradient(0, 0, 0, FADE_HEIGHT);
  gradientTop.addColorStop(0, "#000");
  gradientTop.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradientTop;
  ctx.fillRect(xRange[1] - Y_AXIS_WIDTH, 0, Y_AXIS_WIDTH, FADE_HEIGHT);

  const gradientBottom = ctx.createLinearGradient(
    0,
    yRange[0] - FADE_HEIGHT,
    0,
    yRange[0]
  );
  gradientBottom.addColorStop(0, "rgba(0,0,0,0)");
  gradientBottom.addColorStop(1, "#000");

  ctx.fillStyle = gradientBottom;
  ctx.fillRect(
    xRange[1] - Y_AXIS_WIDTH,
    yScale.range()[0] - FADE_HEIGHT,
    Y_AXIS_WIDTH,
    FADE_HEIGHT
  );

  ctx.beginPath();
  ctx.strokeStyle = Colors.GRAY_LIGHT_1;
  ctx.moveTo(align(xRange[1] - Y_AXIS_WIDTH, pixelRatio), yRange[0]);
  ctx.lineTo(align(xRange[1] - Y_AXIS_WIDTH, pixelRatio), yRange[1]);
  ctx.stroke();
  ctx.closePath();
}

export class YAxisElement implements RenderableElement {
  draw(
    ctx: CanvasRenderingContext2D,
    xScale: ScaleTime,
    yScale: ScaleLinear,
    pixelRatio = 1
  ) {
    addYAxisPath(ctx, xScale, yScale, pixelRatio);
  }
}
