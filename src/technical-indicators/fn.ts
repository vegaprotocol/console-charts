export function identity(d: any) {
  return d;
}

export function noop() {}

export function functor(v: any) {
  return typeof v === "function" ? v : () => v;
}

export function convertNaN(value: any) {
  return typeof value === "number" && isNaN(value) ? undefined : value;
}
