declare global {
  namespace jest {
    interface Matchers<R> {
      toBeEqualWithTolerance(expected: any, precision?: number): R;
    }
  }
}

export {};
