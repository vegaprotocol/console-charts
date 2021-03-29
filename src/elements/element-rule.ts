import { ScaleLinear, ScaleTime } from "d3-scale";

import { PositionalElement } from "../types";

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
    xScale: ScaleTime<number, number, never>,
    yScale: ScaleLinear<number, number, never>
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

    ctx.moveTo(x, Math.floor(y) + 0.5);
    ctx.lineTo(x2, Math.floor(y2) + 0.5);

    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.closePath();
  }
}