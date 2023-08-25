const { contains, isWholeNumber, isNullOrEmptyString } = require("./shortcuts");
const { stringify } = require("./strings");
const { paramTest, getType, typeCheck } = require("./values");

/**
 * check to see if a value is within range
 * @param {number} value test value
 * @param {number} min minimum range
 * @param {number} max maximum range
 * @returns {boolean} true if number is within range
 */
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

/**
 * check any number of ranges for validity
 * @param  {...Array<number>} ranges Each range must be an array with three numbers, the first number is the value, second is the range minimum, and the third is the range maximum
 * @returns {boolean} true if all numbers have valid ranges
 */
function haveValidRanges(...ranges) {
  let rangesAreValid = true;
  ranges.forEach((range) => {
    if (!isInRange(...range)) {
      rangesAreValid = false;
    }
  });
  return rangesAreValid;
}

/**
 * check for valid port range
 * @param {string} name name of the field
 * @param {*} value
 * @returns {boolean} true if valid, false if not
 */

function validPortRange(name, value) {
  paramTest("validPortRange", "name", "string", name);
  if (
    !contains(
      [
        "type",
        "code",
        "port_min",
        "port_max",
        "source_port_min",
        "source_port_max",
      ],
      name
    )
  ) {
    throw new Error(
      `Name must be one of the following: ["type","code","port_min","port_max","source_port_min","source_port_max"] got ${name}`
    );
  }
  let numberValue = parseInt(value);
  if (stringify(numberValue) === "NaN")
    throw new Error(
      `validPortRange expects an integer to be parsed from value. Got type of ${getType(
        value
      )} for value ${value}.`
    );
  let isIcmp = contains(["type", "code"], name);
  if (isIcmp) {
    let icmpMax = name === "type" ? 254 : 255;
    return isInRange(numberValue, 0, icmpMax);
  } else {
    return isInRange(numberValue, 1, 65535);
  }
}

/**
 * check to see if any numbers are not whole
 * @param  {...any} nums arbitrary numbers
 * @returns {boolean} true if any number is not while
 */
function areNotWholeNumbers(...nums) {
  let areNotWhole = false;
  nums.forEach((num) => {
    typeCheck(
      "areNotWholeNumbers expects all arguments to be type",
      "number",
      num
    );
    if (!isWholeNumber(num)) areNotWhole = true;
  });
  return areNotWhole;
}

/**
 * check to see if port value is invalid
 * @param {string} name name of the field
 * @param {*} value
 * @returns {boolean} true if port value is invalid, false if valid
 */
function portRangeInvalid(name, value) {
  if(isNullOrEmptyString(value) || !isWholeNumber(value)){
    return true;
  }
  return !validPortRange(name, value);
}

/**
 * check to see if a value is invalid or not within range
 * @param {number} value test value
 * @param {number} min minimum range
 * @param {number} max maximum range
 * @returns {boolean} true if value is valid, false if valid
 */
function rangeInvalid(value, min, max) {
  if(isNullOrEmptyString(value) || !isWholeNumber(value)){
    return true;
  }
  return !isInRange(value, min, max);
}

module.exports = {
  isInRange,
  validPortRange,
  areNotWholeNumbers,
  haveValidRanges,
  portRangeInvalid,
  rangeInvalid,
};
