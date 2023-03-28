/**
 * functions for arrays
 */

const { paramTest, getType, arrTypeCheck, typeCheck } = require("./values");
const { contains } = require("./shortcuts");
const { splat } = require("./objects");

/**
 * Create a single tiered array from multi tiered array. Acts like HCL flatten()
 * @param {Array} arr array
 * @returns {Array} flattened array
 */
function flatten(arr) {
  paramTest("flatten", "arr", "Array", arr);
  let flatEntries = []; // returned items
  // for each item in the array
  arr.forEach((item) => {
    if (getType(item) === "Array") {
      // if the type is array, call flatten and add to flat entries
      flatEntries = flatEntries.concat(flatten(item));
    } else {
      // otherwise just add
      flatEntries.push(item);
    }
  });
  // return
  return flatEntries;
}

/**
 * readable build number dropdown count
 * @param {number} count number
 * @param {number=} add optionally add to starting value
 * @returns {Array<string>} list of numbers for dropdown
 */
function numberStringList(count, add) {
  paramTest("numberStringList", "count", "number", count);
  if (add) {
    paramTest("numberStringList", "add", "number", add);
  }
  let list = [];
  for (let i = 0; i < count; i++) {
    list.push(`${add ? i + add : i}`);
  }
  return list;
}

/**
 * get all names from arrays of objects within arrays of objects
 * @param {Array<object>} parentArray parent array
 * @param {Array<object>} childArrName name of key to check
 * @param {string} field name of the field to check
 * @returns {Array<string>} list of all items in all sub arrays with name
 */
function nestedSplat(parentArray, childArrName, field) {
  arrTypeCheck(
    "nestedSplat expects parentArray to be array of",
    "object",
    parentArray
  );
  arrTypeCheck(
    `nestedSplat expects parentArray.${childArrName} to be array of`,
    "object",
    parentArray[0][childArrName]
  );
  typeCheck("nestedsplat expects field to be type", "string", field);
  let allItems = [];
  parentArray.forEach((item) => {
    allItems = allItems.concat(splat(item[childArrName], field));
  });
  return allItems;
}

/**
 * delete items missing from store
 * @param {Array<string>} controlItems list of all items
 * @param {Array<string>} arrayItems list of items to check if they exist
 */
function deleteUnfoundArrayItems(controlItems, arrayItems) {
  arrTypeCheck(
    "deleteUnfoundArrayItems expects controlItems to be array of",
    "string",
    controlItems
  );
  arrTypeCheck(
    "deleteUnfoundArrayItems expects arrayItems to be array of",
    "string",
    arrayItems
  );
  let newArray = [];
  arrayItems.forEach((item) => {
    if (contains(controlItems, item)) newArray.push(item);
  });
  return newArray;
}

module.exports = {
  flatten,
  numberStringList,
  deleteUnfoundArrayItems,
  nestedSplat,
};
