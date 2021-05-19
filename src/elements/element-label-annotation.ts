import { sum, zip } from "d3-array";

import { Colors } from "../helpers";
import {
  LabelAnnotation,
  RenderableElement,
  ScaleLinear,
  ScaleTime,
} from "../types";

const HEIGHT = 22;
const PADDING = 4;

export function cumsum(values: number[]) {
  let sum = 0;
  return Array.from(values, (v) => (sum += v || 0));
}

export type Cell = {
  label: string;
  stroke?: boolean;
  fill?: boolean;
  onClick?: () => void;
};

function addLabel(
  ctx: CanvasRenderingContext2D,
  xScale: ScaleTime,
  yScale: ScaleLinear,
  pixelRatio: number,
  label: LabelAnnotation,
  y: number
) {
  const stroke = label.intent === "success" ? Colors.GREEN : Colors.RED;

  ctx.font = `${14}px sans-serif`;
  ctx.textBaseline = "middle";
  ctx.lineWidth = 2;
  ctx.strokeStyle = stroke;

  // Calculate widths of cells
  const widths = label.cells.map(
    (cell) => ctx.measureText(cell.label).width + 2 * PADDING
  );

  const totalWidth = sum(widths);

  // Dashed price line
  ctx.beginPath();
  ctx.setLineDash([2 * pixelRatio, 3 * pixelRatio]);
  ctx.moveTo(totalWidth, y);
  ctx.lineTo(Math.max(xScale.range()[1] / 2, totalWidth), yScale(label.y));
  ctx.lineTo(xScale.range()[1], yScale(label.y));
  ctx.stroke();
  ctx.closePath();
}

export class LabelAnnotationElement implements RenderableElement {
  readonly labels: LabelAnnotation[];

  constructor(cfg: { labels: LabelAnnotation[] }) {
    const { labels } = cfg;

    this.labels = [...labels].sort((a, b) => b.y - a.y);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    xScale: ScaleTime,
    yScale: ScaleLinear,
    pixelRatio: number = 1
  ) {
    let previousY = -Infinity;

    const yPositions = this.labels.map((label) => yScale(label.y));
    const sortedYPositions = [...yPositions].sort((a, b) => a - b);
    const shiftedYPositions = sortedYPositions.reduce<number[]>((p, y) => {
      const ypx = y;

      let ny = ypx;

      if (ypx - previousY < HEIGHT) {
        ny = previousY + HEIGHT;
      }

      p.push(ny);

      previousY = ny || ypx;

      return p;
    }, []);

    for (const label of zip<any>(this.labels, shiftedYPositions)) {
      addLabel(
        ctx,
        xScale,
        yScale,
        pixelRatio,
        label[0] as LabelAnnotation,
        label[1] as number
      );
    }
  }
}
