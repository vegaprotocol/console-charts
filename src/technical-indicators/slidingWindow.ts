import { identity, noop, functor } from "./fn";

export function slidingWindow() {
  let period = () => 10;
  let accumulator: (values: any[], index: number) => any = noop;
  let value = identity;
  let defined = (d: any) => d != null;

  const slidingWindow = function (data: any[]) {
    const size = period();

    const windowData = data.slice(0, size).map(value);

    return data.map((d, i) => {
      if (i >= size) {
        // Treat windowData as FIFO rolling buffer
        windowData.shift();
        windowData.push(value(d));
      }

      if (i < size - 1 || windowData.some((d) => !defined(d))) {
        return accumulator([], i);
      }

      return accumulator(windowData, i);
    });
  };

  slidingWindow.period = (newPeriod: number) => {
    period = functor(newPeriod);
    return slidingWindow;
  };

  slidingWindow.accumulator = (
    newAccumulator: (values: any[], index: number) => any
  ) => {
    accumulator = newAccumulator;
    return slidingWindow;
  };

  slidingWindow.defined = (newDefined: (d: any) => boolean) => {
    defined = newDefined;
    return slidingWindow;
  };

  slidingWindow.value = (newValue: (d: any) => number) => {
    value = newValue;
    return slidingWindow;
  };

  return slidingWindow;
}
