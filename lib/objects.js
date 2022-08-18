const { eachKey } = require("./shortcuts");
const { paramTest } = require("./values");

/**
 * Set keys from one object to another in place
 * @param {Object} source source object
 * @param {Object} destination where values from the source object will be added
 */
function transpose(source, destination) {
  paramTest(transpose, arguments, {
    source: "object",
    destination: "object",
  });
  eachKey(source, (key) => {
    destination[key] = source[key];
  });
}

module.exports = {
  transpose,
};
