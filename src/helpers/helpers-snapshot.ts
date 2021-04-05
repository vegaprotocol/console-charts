import * as React from "react";

/**
 * Produces an image of the chart.
 *
 * @param chartRef React ref to chart component
 * @returns A promise that will fulfill with a new Blob object represnting a file containing an image.
 */
export async function asyncSnapshot(chartRef: React.RefObject<HTMLElement>) {
  if (chartRef.current) {
    const bbox = chartRef.current.getBoundingClientRect();

    // FIXME: These queries are extremely brittle. Replace with something more robust.
    const baseCanvas = chartRef.current.querySelector<HTMLCanvasElement>(
      ".plot-area d3fc-canvas.base canvas"
    ) as HTMLCanvasElement;

    const foregroundCanvas = chartRef.current.querySelector<HTMLCanvasElement>(
      ".plot-area d3fc-canvas.foreground canvas"
    ) as HTMLCanvasElement;

    const studyBaseCanvas = chartRef.current.querySelector<HTMLCanvasElement>(
      ".plot-area:nth-child(3) d3fc-canvas.base canvas"
    );

    const studyForegroundCanvas = chartRef.current.querySelector<HTMLCanvasElement>(
      ".plot-area:nth-child(3) d3fc-canvas.foreground canvas"
    );

    const xAxisCanvas = chartRef.current.querySelector<HTMLCanvasElement>(
      ".x-axis canvas"
    ) as HTMLCanvasElement;

    const devicePixelRatio = window.devicePixelRatio;

    const offscreen = new OffscreenCanvas(
      devicePixelRatio * bbox.width,
      devicePixelRatio * bbox.height
    );

    const offScreenContext = offscreen.getContext("2d");

    if (offScreenContext) {
      offScreenContext.drawImage(baseCanvas, 0, 0);
      offScreenContext.drawImage(foregroundCanvas, 0, 0);

      let offset = baseCanvas.height;

      if (studyBaseCanvas && studyForegroundCanvas) {
        offScreenContext.drawImage(studyBaseCanvas, 0, baseCanvas.height);
        offScreenContext.drawImage(studyForegroundCanvas, 0, baseCanvas.height);

        offScreenContext.save();
        offScreenContext.beginPath();
        offScreenContext.moveTo(0, baseCanvas.height + 0.5);
        offScreenContext.lineTo(baseCanvas.width, baseCanvas.height + 0.5);

        offScreenContext.strokeStyle = "#fff";
        offScreenContext.stroke();
        offScreenContext.closePath();
        offScreenContext.restore();

        offset += studyBaseCanvas.height;
      }

      offScreenContext.drawImage(xAxisCanvas, 0, offset);

      offScreenContext.save();
      offScreenContext.beginPath();
      offScreenContext.moveTo(0, offset + 0.5);
      offScreenContext.lineTo(baseCanvas.width, offset + 0.5);

      offScreenContext.strokeStyle = "#fff";
      offScreenContext.stroke();
      offScreenContext.closePath();
      offScreenContext.restore();

      return await offscreen.convertToBlob();
    } else {
      return null;
    }
  } else {
    return null;
  }
}
