const { paramTest, getType } = require("./values");
const { eachKey, prettyJSON } = require("./shortcuts");

/**
 * Get the length of the longest key from an object
 * @param {Object} obj arbitrary object
 * @returns {number} integer length of the longest key in the object
 */
function getLongestKey(obj) {
  paramTest(getLongestKey, arguments, { obj: "object" });
  let longest = 0;
  eachKey(obj, (key) => {
    if (key.length > longest) longest = key.length;
  });
  return longest;
}

/**
 * Match the length of a string to a number by appending spaces
 * @param {string} str string
 * @param {number} count number to match
 * @returns {string} string with added spaces
 */
function matchLength(str, count) {
  paramTest(matchLength, arguments, { str: "string", count: "number" });
  while (str.length < count) {
    str = str + " ";
  }
  return str;
}

/**
 * Remove trailing spaces from the end of a string
 * @param {string} str The string to have spaces removed from
 * @returns {string} The string with no trailing spaces
 */
function removeTrailingSpaces(str) {
  paramTest(removeTrailingSpaces, arguments, { str: "string" });
  let splitStr = str.split("");
  while (splitStr[splitStr.length - 1] === " ") {
    splitStr.pop();
  }
  return splitStr.join("");
}

/**
 * Create a string from any data type
 * @param {*} data data
 * @returns {string} data coverted to string
 */
function stringify(data) {
  let dataType = getType(data);
  if (dataType === "Function") return data.toString();
  if (dataType === "Array" || dataType === "object") return prettyJSON(data);
  else return `${data}`;
}

/**
 * Capitalize the first letter of a string
 * @param {string} str String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  paramTest(capitalize, arguments, { str: "string" });
  let splitStr = str.split("");
  splitStr[0] = splitStr[0].toUpperCase();
  return splitStr.join("");
}

module.exports = {
  getLongestKey,
  matchLength,
  removeTrailingSpaces,
  stringify,
  capitalize,
};

