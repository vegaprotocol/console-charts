import { Colors } from "../lib/vega-colours";

interface Element {
  draw(ctx: CanvasRenderingContext2D, xScale: any, yScale: any): void;
}

export function addCandlePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  open: number,
  close: number,
  high: number,
  low: number,
  width: number
) {
  ctx.rect(x - width / 2, open, width, close - open);
  ctx.moveTo(x, Math.min(close, open));
  ctx.lineTo(x, high);
  ctx.moveTo(x, Math.max(close, open));
  ctx.lineTo(x, low);
}

export class CandleElement implements Element {
  readonly x: number;
  readonly open: number;
  readonly close: number;
  readonly high: number;
  readonly low: number;
  readonly width: number;

  constructor(candle: any) {
    const { x, open, close, high, low, width } = candle;

    this.x = x;
    this.open = open;
    this.close = close;
    this.high = high;
    this.low = low;
    this.width = width;
  }

  draw(ctx: CanvasRenderingContext2D, xScale: any, yScale: any) {
    ctx.save();
    ctx.beginPath();

    addCandlePath(
      ctx,
      xScale(this.x),
      yScale(this.open),
      yScale(this.close),
      yScale(this.high),
      yScale(this.low),
      xScale(this.width) - xScale(0)
    );

    ctx.fillStyle = this.open > this.close ? Colors.RED : Colors.GREEN_DARK;
    ctx.strokeStyle = this.open > this.close ? Colors.RED : Colors.GREEN;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}
