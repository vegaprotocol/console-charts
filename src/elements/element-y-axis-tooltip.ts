import { FONT_FAMILY_MONOSPACE, TICK_LABEL_FONT_SIZE, Y_AXIS_WIDTH } from "../constants";
import { Colors } from "../helpers";
import { formatter } from "../helpers";
import { ScaleLinear, ScaleTime } from "../types";
import { RenderableElement } from "../types";

function addYAxisPath(
  ctx: CanvasRenderingContext2D,
  xScale: ScaleTime,
  yScale: ScaleLinear,
  position: number | null,
  decimalPlaces: number
) {
  if (position) {
    const width = xScale.range()[1];

    ctx.font = `${TICK_LABEL_FONT_SIZE}px ${FONT_FAMILY_MONOSPACE}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const xPad = 5;
    const text = formatter(position, decimalPlaces);
    const rectHeight = 18;

    let y = yScale(position);

    ctx.beginPath();
    ctx.moveTo(width - Y_AXIS_WIDTH - 10, y);
    ctx.lineTo(width - Y_AXIS_WIDTH, y - rectHeight / 2);
    ctx.lineTo(width, y - rectHeight / 2);
    ctx.lineTo(width, y + rectHeight / 2);
    ctx.lineTo(width - Y_AXIS_WIDTH, y + rectHeight / 2);
    ctx.closePath();

    ctx.fillStyle = Colors.GRAY_DARK_1;
    ctx.strokeStyle = Colors.GRAY_LIGHT_1;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = Colors.WHITE;
    ctx.fillText(text, width - Y_AXIS_WIDTH + xPad, y);
    ctx.closePath();
  }
}

export class YAxisTooltipElement implements RenderableElement {
  readonly decimalPlaces: number;

  constructor(decimalPlaces: number) {
    this.decimalPlaces = decimalPlaces;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    xScale: ScaleTime,
    yScale: ScaleLinear,
    pixelRatio: number = 1,
    position: number | null
  ) {
    addYAxisPath(ctx, xScale, yScale, position, this.decimalPlaces);
  }
}
