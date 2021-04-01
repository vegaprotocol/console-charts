import { ScaleLinear, ScaleTime } from "d3-scale";

import { Colors } from "../helpers";
import { RenderableElement } from "../types";
import { WIDTH } from "../constants";

function addYAxisPath(
  ctx: CanvasRenderingContext2D,
  xScale: ScaleTime<number, number, never>,
  yScale: ScaleLinear<number, number, never>,
  position: number | null,
  decimalPlaces: number
) {
  if (position) {
    const width = xScale.range()[1];

    ctx.font = `12px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const value = position;
    const xPad = 5;
    const text = value.toFixed(decimalPlaces);
    const rectHeight = 18;

    let yAdjusted = yScale(position);

    if (yScale(position) - rectHeight / 2 < 0) {
      yAdjusted = rectHeight / 2;
    }

    if (yScale(position) + rectHeight / 2 > yScale.range()[0]) {
      yAdjusted = yScale.range()[0] - rectHeight / 2;
    }

    ctx.save();

    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = Colors.GRAY_LIGHT;

    ctx.beginPath();
    ctx.moveTo(xScale.range()[0], Math.round(yScale(position)) + 0.5);
    ctx.lineTo(xScale.range()[1], Math.round(yScale(position)) + 0.5);
    ctx.stroke();
    ctx.closePath();

    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(width - WIDTH - 10, yAdjusted);
    ctx.lineTo(width - WIDTH, yAdjusted - rectHeight / 2);
    ctx.lineTo(width, yAdjusted - rectHeight / 2);
    ctx.lineTo(width, yAdjusted + rectHeight / 2);
    ctx.lineTo(width - WIDTH, yAdjusted + rectHeight / 2);
    ctx.closePath();

    ctx.fillStyle = Colors.GRAY_DARK_1;
    ctx.strokeStyle = Colors.GRAY_LIGHT_1;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = Colors.WHITE;
    ctx.fillText(text, width - WIDTH + xPad, yAdjusted);
    ctx.closePath();
  }
}

export class YAxisAnnotationElement implements RenderableElement {
  readonly decimalPlaces: number;
  readonly position: number;

  constructor(position: number, decimalPlaces: number) {
    this.position = position;
    this.decimalPlaces = decimalPlaces;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    xScale: ScaleTime<number, number, never>,
    yScale: ScaleLinear<number, number, never>
  ) {
    addYAxisPath(ctx, xScale, yScale, this.position, this.decimalPlaces);
  }
}
