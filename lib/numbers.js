const { paramTest } = require("./values");

function isInRange(value, min, max) {
  paramTest(
    "isInRange",
    "value",
    "number",
    value,
    "min",
    "number",
    min,
    "max",
    "number",
    max
  );
  if (min > max) {
    throw new Error(
      `isInRange expects min(${min}) to be less than or equal to max(${max}).`
    );
  }
  return parseInt(value) >= min && parseInt(value) <= max;
}

module.exports = {
  isInRange,
};
