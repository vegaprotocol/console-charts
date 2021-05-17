interface ResizeObserverOptions {
  /**
   * Sets which box model the observer will observe changes to. Possible values
   * are `content-box` (the default), and `border-box`.
   *
   * @default 'content-box'
   */
  box?: ("content-box" | "border-box" | "device-pixel-content-box")[];
}

interface ResizeObserverSize {
  readonly inlineSize: number;
  readonly blockSize: number;
}

interface ResizeObserver {
  disconnect(): void;
  observe(target: Element, options?: ResizeObserverOptions): void;
  unobserve(target: Element): void;
}

declare var ResizeObserver: {
  new (callback: ResizeObserverCallback): ResizeObserver;
  prototype: ResizeObserver;
};

interface ResizeObserverCallback {
  (entries: ResizeObserverEntry[], observer: ResizeObserver): void;
}

interface ResizeObserverEntry {
  readonly target: Element;
  readonly contentRect: DOMRectReadOnly;
  readonly borderBoxSize: ReadonlyArray<ResizeObserverSize>;
  readonly contentBoxSize: ReadonlyArray<ResizeObserverSize>;
  readonly devicePixelContentBoxSize?: ReadonlyArray<ResizeObserverSize>;
}

export function clearCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  fillStyle?: string
) {
  ctx.save();
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.restore();
}

export function align(x: number, pixelRatio: number = 1) {
  return Math.round(pixelRatio * Math.round(x)) / pixelRatio + 0.5 / pixelRatio;
}

export function alignSpan(x: number, pixelRatio: number = 1) {
  return Math.round(pixelRatio * Math.round(x)) / pixelRatio;
}

export async function hasDevicePixelContentBox() {
  try {
    return new Promise((resolve) => {
      const ro = new ResizeObserver((entries) => {
        resolve(entries.every((entry) => "devicePixelContentBoxSize" in entry));
        ro.disconnect();
      });

      ro.observe(document.body, {
        box: ["device-pixel-content-box"],
      });
    });
  } catch (e) {
    return false;
  }
}
