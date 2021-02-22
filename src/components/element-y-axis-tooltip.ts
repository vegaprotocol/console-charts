import { Colors } from "../lib/vega-colours";
import { Element } from "../types/element";

export function addYAxisPath(
  ctx: CanvasRenderingContext2D,
  xScale: any,
  yScale: any,
  position: [number | null, number | null],
  decimalPlaces = 5
) {
  const y = position[1];

  if (y) {
    const width = xScale.range()[1];

    ctx.font = `12px monospace`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const value = yScale.invert(y);
    const xPad = 5;
    const text = value.toFixed(decimalPlaces);
    const textWidth = ctx.measureText(text).width;
    const rectWidth = textWidth + xPad;
    const rectHeight = 18;

    let yAdjusted = y;

    if (y - rectHeight / 2 < 0) {
      yAdjusted = rectHeight / 2;
    }

    if (y + rectHeight / 2 > yScale.range()[0]) {
      yAdjusted = yScale.range()[0] - rectHeight / 2;
    }

    ctx.beginPath();
    ctx.moveTo(width - rectWidth - 10, yAdjusted);
    ctx.lineTo(width - rectWidth, yAdjusted - rectHeight / 2);
    ctx.lineTo(width, yAdjusted - rectHeight / 2);
    ctx.lineTo(width, yAdjusted + rectHeight / 2);
    ctx.lineTo(width - rectWidth, yAdjusted + rectHeight / 2);
    ctx.closePath();

    ctx.fillStyle = Colors.GRAY_DARK_1;
    ctx.strokeStyle = "white";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = Colors.WHITE;
    ctx.fillText(text, width - xPad, yAdjusted);
    ctx.closePath();
  }
}

export class YAxisTooltipElement implements Element {
  draw(
    ctx: CanvasRenderingContext2D,
    xScale: any,
    yScale: any,
    position: [number | null, number | null]
  ) {
    addYAxisPath(ctx, xScale, yScale, position);
  }
}