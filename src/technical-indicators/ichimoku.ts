import { min, zip } from "d3-array";
import { exponentialMovingAverage } from "./exponentialMovingAverage";
import { slidingWindow } from "./slidingWindow";
import { convertNaN } from "./fn";
import { max } from "d3-array";

export function ichimokuIndicator() {
  let closeValue = (d: any) => d.close;
  let highValue = (d: any) => d.high;
  let lowValue = (d: any) => d.low;

  const slidingWindowHigh9 = slidingWindow()
    .period(9)
    .accumulator((values) => max(values));

  const slidingWindowHigh26 = slidingWindow()
    .period(26)
    .accumulator((values) => max(values));

  const slidingWindowHigh52 = slidingWindow()
    .period(52)
    .accumulator((values) => max(values));

  const slidingWindowLow9 = slidingWindow()
    .period(9)
    .accumulator((values) => min(values));

  const slidingWindowLow26 = slidingWindow()
    .period(26)
    .accumulator((values) => min(values));

  const slidingWindowLow52 = slidingWindow()
    .period(52)
    .accumulator((values) => min(values));

  const slidingWindowClose26 = slidingWindow()
    .period(26)
    .accumulator((values) => values[0]);

  const ichimoku = (data: any[]) => {
    slidingWindowHigh9.value(highValue);
    slidingWindowHigh26.value(highValue);
    slidingWindowHigh52.value(highValue);
    slidingWindowLow9.value(lowValue);
    slidingWindowLow26.value(lowValue);
    slidingWindowLow52.value(lowValue);
    slidingWindowClose26.value(closeValue);

    return zip(
      data,
      slidingWindowHigh9(data),
      slidingWindowLow9(data),
      slidingWindowHigh26(data),
      slidingWindowLow26(data),
      slidingWindowHigh52(data),
      slidingWindowLow52(data),
      slidingWindowClose26(data)
    ).map((d) => {
      const conversion = convertNaN((d[1] + d[2]) / 2);
      const baseline = convertNaN((d[3] + d[4]) / 2);
      const leadingSpanA = convertNaN(
        ((d[1] + d[2]) / 2 + (d[3] + d[4]) / 2) / 2
      );
      const leadingSpanB = convertNaN((d[5] + d[6]) / 2);
      const laggingSpan = convertNaN(d[7]);

      return { conversion, baseline, leadingSpanA, leadingSpanB, laggingSpan };
    });
  };

  ichimoku.closeValue = (newCloseValue: (d: any) => any) => {
    closeValue = newCloseValue;
    return ichimoku;
  };

  ichimoku.highValue = (newHighValue: (d: any) => any) => {
    highValue = newHighValue;
    return ichimoku;
  };

  ichimoku.lowValue = (newLowValue: (d: any) => any) => {
    lowValue = newLowValue;
    return ichimoku;
  };

  return ichimoku;
}
