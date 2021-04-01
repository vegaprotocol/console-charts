import { identity, functor, convertNaN } from "./fn";
import { mean } from "d3-array";

export function exponentialMovingAverage() {
  let value = identity;
  let period = 9;

  const initialMovingAverageAccumulator = (period: number) => {
    let values: number[] = [];

    return (value: number) => {
      let movingAverage;

      if (values.length < period) {
        if (value != null) {
          values.push(value);
        } else {
          values = [];
        }
      }

      if (values.length >= period) {
        movingAverage = mean(values);
      }

      return movingAverage;
    };
  };

  const exponentialMovingAverage = function (data: number[]) {
    const size = period;

    const alpha = 2 / (size + 1);
    const initialAccumulator = initialMovingAverageAccumulator(size);

    let ema: number | undefined;

    return data.map((d) => {
      const v = value(d);

      if (ema === undefined) {
        ema = initialAccumulator(v);
      } else {
        ema = v * alpha + (1 - alpha) * ema;
      }

      return convertNaN(ema);
    });
  };

  exponentialMovingAverage.period = (newPeriod: number) => {
    period = newPeriod;
    return exponentialMovingAverage;
  };

  exponentialMovingAverage.value = (newValue: (d: any) => any) => {
    value = newValue;
    return exponentialMovingAverage;
  };

  return exponentialMovingAverage;
}
