import { Colors, align, alignSpan } from "../helpers";
import { PositionalElement, ScaleLinear, ScaleTime } from "../types";

export type Bar = {
  x: Date;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
};

export class BarElement implements PositionalElement {
  readonly x: Date;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fill: string;
  readonly stroke: string;

  constructor(cfg: any) {
    const { x, y, width, height, fill, stroke } = cfg;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fill = fill;
    this.stroke = stroke;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    xScale: ScaleTime,
    yScale: ScaleLinear,
    pixelRatio: number = 1
  ) {
    ctx.beginPath();

    const pixelWidth = Math.max(xScale(this.width) - xScale(0), 1 / pixelRatio);

    ctx.rect(
      align(xScale(this.x.getTime() - this.width / 2), pixelRatio),
      align(yScale(this.y), pixelRatio),
      alignSpan(pixelWidth, pixelRatio),
      alignSpan(Math.abs(yScale(this.height) - yScale(0)), pixelRatio)
    );

    ctx.fillStyle = this.fill ?? Colors.GRAY;
    ctx.fill();

    ctx.lineWidth = 1 / pixelRatio;
    ctx.strokeStyle = this.stroke ?? this.fill;

    ctx.stroke();
  }
}
