const { RegexButWithWords } = require("regex-but-with-words");

/**
 * Functions for testing and checking values
 */

/**
 * Lazy get
 * @param {*} value Value
 * @returns {string} Array for array, Function for function, `typeof` for other types
 */
function getType(value) {
  if (typeof value === "object" && Array.isArray(value)) {
    return "Array";
  }
  if (value instanceof Function) {
    return "Function";
  }
  return typeof value;
}

/**
 * Checks a value type
 * @param {string} message Display message
 * @param {string} type Expected type
 * @param {*} value value to test
 * @throws When type is not found
 */
function typeCheck(message, type, value) {
  if (
    ["string", "number", "object", "boolean", "Array", "Function"].indexOf(
      type
    ) === -1
  ) {
    throw new Error(
      `typeCheck expected one of the following types: ["string", "number", "object", "boolean", "Array", "Function"] got: ${type}`
    );
  }
  if (getType(value) !== type) {
    throw new Error(`${message} ${type} got ${getType(value)}`);
  }
}

/**
 * Get function params
 * @param {Function} fn Function to check
 * @returns {Array<string>} list of argument names
 */
function getFunctionParams(fn) {
  typeCheck("getFunctionParams expects fn to be type", "Function", fn);
  return fn
    .toString() // create string
    .replace(
      // replace everything but arguments and split at comma
      new RegexButWithWords()
        .literal("function")
        .whitespace()
        .anyNumber()
        .group((exp) => exp.word().oneOrMore())
        .lazy()
        .whitespace()
        .anyNumber()
        .literal("(")
        .or()
        .literal(")")
        .whitespace()
        .anyNumber()
        .literal("{")
        .negatedSet(() => {})
        .oneOrMore()
        .done("g"),
      ""
    )
    .split(/\s*,\s*/);
}

/**
 * Check all items in an array for a specific type
 * @param {string} message Display message
 * @param {string} type type to check
 * @param {*} arr Array to check
 * @throws if types of each item in the array do not match
 */
function arrTypeCheck(message, type, arr) {
  paramTest(arrTypeCheck, arguments, {
    message: "string",
    type: "string",
    arr: "Array",
  });
  let types = [], // list of types
    allMatch = true; // all match
  arr.forEach((entry) => {
    let entryType = getType(entry); // Get type
    types.push(entryType); // add to list
    if (entryType !== type) allMatch = false; // if doesn't match, all match becomes false
  });
  if (!allMatch) {
    throw new Error(`${message} type ${type} got ${JSON.stringify(types)}`);
  }
}

/**
 * Run tests against a function for parameter types
 * @param {Function} fn Function to test
 * @param {arguments} functionArgs function arguments
 * @param {Object} argTests key value map where the key is the arg name and the value is the expected type
 * @throws when an invalid argument is passed
 */
function paramTest(fn, functionArgs, argTests) {
  let argumentList = getFunctionParams(fn);
  let functionName = fn.name || "Anonymous";
  // For each key in the test obect
  Object.keys(argTests).forEach((test) => {
    let testType = argTests[test]; // Get the test type
    let checkArrType = false; // check array type
    // If the test type matches Array<...> then
    if (argTests[test].match(/^Array<\w+>$/)) {
      // Set type to array
      testType = "Array";
      // Set check arr type to the expected type
      checkArrType = argTests[test].replace(/^Array<|\>$/g, "");
    }
    // Run typecheck
    typeCheck(
      `${functionName} expects ${test} to be type`,
      testType,
      functionArgs[argumentList.indexOf(test)]
    );
    // If checkArrType isn't false, run array type check
    if (checkArrType) {
      arrTypeCheck(
        `${functionName} expects all entries in ${test} to be`,
        checkArrType,
        functionArgs[argumentList.indexOf(test)]
      );
    }
  });
}

/**
 * Test to see if an object has needed keys
 * @param {Object} value Value to check
 * @param {Array<string>} keys Keys to check for
 * @param {boolean?} strict Check to ensure only keys are present, otherwise non-present keys are ok
 * @returns {boolean} True if all params match
 */
function keyTest(value, checkKeys, strict) {
  paramTest(keyTest, arguments, {
    value: "object",
    checkKeys: "Array<string>",
  });
  if (strict && Object.keys(value).length !== checkKeys.length) return false;
  let allKeysFound = true;
  checkKeys.forEach((key) => {
    if (Object.keys(value).indexOf(key) === -1) allKeysFound = false;
  });
  return allKeysFound;
}

/**
 * Check an object for correct keys
 * @param {string} message Display message
 * @param {Object} value Value to check
 * @param {Array<string>} keys Keys to check for
 * @param {boolean?} strict Check to ensure only keys are present, otherwise non-present keys are ok
 * @throws if keys do not match
 */
function keyCheck(message, value, checkKeys, strict) {
  paramTest(keyCheck, arguments, {
    message: "string",
    value: "object",
    checkKeys: "Array",
  });
  if (!keyTest(value, checkKeys, strict))
    throw new Error(
      `${message}${strict ? ` ${checkKeys.length} keys` : ""} ${JSON.stringify(
        checkKeys
      )} got ${JSON.stringify(Object.keys(value))}`
    );
}

/**
 * Test to see if an array of strings contains a value
 * @param {string} message Display Message
 * @param {Array} arr array
 * @param {string} value Value to check
 * @throws If array oes not contain value
 */
function containsCheck(message, arr, value) {
  paramTest(containsCheck, arguments, { message: "string", arr: "Array<string>" });
  if (arr.indexOf(value) === -1) {
    throw new Error(`${message} got ${JSON.stringify(value)}`);
  }
}

/**
 * Checks to see if any instances of string from one array are found in another
 * @param {Array} sourceArr Array to compare against
 * @param {Array} arr Array to search for
 * @returns {boolean} If any instance is found
 */
function containsAny(sourceArr, arr) {
  paramTest(containsAny, arguments, {
    sourceArr: "Array<string>",
    arr: "Array<string>",
  });
  let found = false;
  arr.forEach((entry) => {
    if (sourceArr.indexOf(entry) !== -1) {
      found = true;
    }
  });
  return found;
}

/**
 * Shortcut for getType(value) === "Function"
 * @param {*} value Any value
 * @returns {boolean} true if function
 */
function isFunction(value) {
  return getType(value) === "Function";
}

const values = {
  getType: getType,
  typeCheck: typeCheck,
  getFunctionParams: getFunctionParams,
  paramTest: paramTest,
  arrTypeCheck: arrTypeCheck,
  keyTest: keyTest,
  keyCheck: keyCheck,
  containsCheck: containsCheck,
  containsAny: containsAny,
  isFunction: isFunction,
};

module.exports = values;
