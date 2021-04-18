import { mergeData } from "./helpers-data";
import { range } from "d3-array";

type Datum = { date: Date };

const arrayA = range(10).map((d) => new Date(2021, 1, d));
const arrayC = range(10).map((d) => new Date(2021, 1, d + 5));

describe("mergeData", () => {
  it("merges empty arrays", () => {
    const a: Datum[] = [];
    const b: Datum[] = [];
    expect(mergeData(a, b)).toEqual([]);
  });

  it("merges with second array empty", () => {
    const a: Datum[] = arrayA.map((d) => ({
      date: d,
    }));
    const b: Datum[] = [];
    expect(mergeData(a, b)).toEqual(
      arrayA.map((d) => ({
        date: d,
      }))
    );
  });

  it("merges with first array empty", () => {
    const a: Datum[] = arrayA.map((d) => ({
      date: d,
    }));
    const b: Datum[] = [];
    expect(mergeData(b, a)).toEqual(
      arrayA.map((d) => ({
        date: d,
      }))
    );
  });

  it("merges overlapping arrays", () => {
    const a: Datum[] = arrayA.map((d) => ({
      date: d,
    }));
    const b: Datum[] = arrayC.map((d) => ({
      date: d,
    }));
    expect(mergeData(a, b)).toEqual(
      range(15)
        .map((d) => new Date(2021, 1, d))
        .map((d) => ({
          date: d,
        }))
    );
  });
});
