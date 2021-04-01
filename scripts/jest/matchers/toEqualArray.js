const arrayEquals = (a, b) =>
  a.length === b.length && a.every((item, index) => b[index] === item);

exports.toEqualArray = (actual, expected) => ({
  pass:
    actual.length === expected.length &&
    actual.every((item, index) => arrayEquals(item, expected[index])),
});
