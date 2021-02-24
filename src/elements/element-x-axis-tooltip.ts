import { ScaleLinear, ScaleTime } from "d3-scale";

import { Colors } from "../helpers";
import { Element } from "../types/element";
import { format } from "date-fns";

function addXAxisTooltipPath(
  ctx: CanvasRenderingContext2D,
  xScale: ScaleTime<number, number, never>,
  yScale: ScaleLinear<number, number, never>,
  position: [number | null, number | null]
) {
  const x = position[0];

  if (x) {
    const height = 24.5;

    ctx.font = `12px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const value = xScale.invert(x);
    const xPad = 5;
    const text = format(value, "HH:mm");
    const textWidth = ctx.measureText(text).width;
    const rectWidth = textWidth + xPad * 2;
    const rectHeight = 19;

    let xAdjusted = x;

    if (x - rectWidth / 2 < 0) {
      xAdjusted = rectWidth / 2;
    }

    if (x + rectWidth / 2 > xScale.range()[1]) {
      xAdjusted = xScale.range()[1] - rectWidth / 2;
    }

    ctx.beginPath();
    ctx.moveTo(x, height - rectHeight - 5);
    ctx.lineTo(x + 5, height - rectHeight);
    ctx.lineTo(xAdjusted + rectWidth / 2, height - rectHeight);
    ctx.lineTo(xAdjusted + rectWidth / 2, height);
    ctx.lineTo(xAdjusted - rectWidth / 2, height);
    ctx.lineTo(xAdjusted - rectWidth / 2, height - rectHeight);
    ctx.lineTo(x - 5, height - rectHeight);
    ctx.closePath();

    ctx.fillStyle = Colors.GRAY_DARK_1;
    ctx.strokeStyle = Colors.GRAY_LIGHT_1;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = Colors.WHITE;
    ctx.fillText(text, xAdjusted, height - rectHeight / 2);
    ctx.closePath();
  }
}

export class XAxisTooltipElement implements Element {
  draw(
    ctx: CanvasRenderingContext2D,
    xScale: ScaleTime<number, number, never>,
    yScale: ScaleLinear<number, number, never>,
    position: [number | null, number | null]
  ) {
    addXAxisTooltipPath(ctx, xScale, yScale, position);
  }
}
