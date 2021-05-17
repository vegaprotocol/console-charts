import { PositionalElement, ScaleLinear, ScaleTime } from "../types";
import { align, alignSpan } from "../helpers";

export type Rule = {
  points: [Date, number][];
  color: string;
};

export class RuleElement implements PositionalElement {
  readonly x: Date;
  readonly x2: Date;
  readonly y: number;
  readonly y2: number;
  readonly color: string;

  constructor(cfg: any) {
    const { x, x2, y, y2, color } = cfg;

    this.x = x;
    this.x2 = x2;
    this.y = y;
    this.y2 = y2;
    this.color = color;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    xScale: ScaleTime,
    yScale: ScaleLinear,
    pixelRatio: number = 1
  ) {
    let x;
    let x2;
    let y;
    let y2;

    if (this.x === null) {
      x = xScale.range()[0];
      x2 = xScale.range()[1];
      y = yScale(this.y);
      y2 = this.y2 === null ? y : yScale(this.y2);
    } else if (this.y === null) {
      x = xScale(this.x);
      x2 = this.x2 === null ? x : xScale(this.x2);
      y = yScale.range()[0];
      y2 = yScale.range()[1];
    } else {
      x = xScale(this.x);
      x2 = this.x2 === null ? x : xScale(this.x2);
      y = yScale(this.y);
      y2 = this.y2 === null ? y : yScale(this.y2);
    }

    ctx.beginPath();

    ctx.moveTo(align(x, pixelRatio), align(y, pixelRatio));
    ctx.lineTo(align(x2, pixelRatio), align(y2, pixelRatio));

    ctx.strokeStyle = this.color;
    ctx.lineCap = "square";
    ctx.lineWidth = 1 / pixelRatio;
    ctx.stroke();
    ctx.closePath();
  }
}
