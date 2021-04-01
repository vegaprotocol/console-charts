import { ichimokuIndicator } from "./ichimoku";

describe("ichimoku", () => {
  it("should match the expected output", () => {
    const input = [
      {
        High: 1,
        Low: 1,
        Close: 1,
      },
      {
        High: 2,
        Low: 2,
        Close: 2,
      },
      {
        High: 3,
        Low: 3,
        Close: 3,
      },
      {
        High: 4,
        Low: 4,
        Close: 4,
      },
    ];

    const expectedOutput = [
      {
        conversion: undefined,
        baseline: undefined,
        leadingSpanA: undefined,
        leadingSpanB: undefined,
        laggingSpan: undefined,
      },
      {
        conversion: undefined,
        baseline: undefined,
        leadingSpanA: undefined,
        leadingSpanB: undefined,
        laggingSpan: undefined,
      },
      {
        conversion: undefined,
        baseline: undefined,
        leadingSpanA: undefined,
        leadingSpanB: undefined,
        laggingSpan: undefined,
      },
      {
        conversion: undefined,
        baseline: undefined,
        leadingSpanA: undefined,
        leadingSpanB: undefined,
        laggingSpan: undefined,
      },
    ];

    const ichimoku = ichimokuIndicator()
      .closeValue((d) => d.Close)
      .highValue((d) => d.High)
      .lowValue((d) => d.Low);

    const output = ichimoku(input);

    expect(output.map((d) => d.conversion)).toBeEqualWithTolerance(
      expectedOutput.map((d) => d.conversion)
    );

    expect(output.map((d) => d.baseline)).toBeEqualWithTolerance(
      expectedOutput.map((d) => d.baseline)
    );
  });
});
