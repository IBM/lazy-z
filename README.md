# lazy-z utils

lazy-z is a light-weight NodeJS library for assorted shortcuts and utilities

## Table of Contents

1. [Installation](#installation)
2. [Shortcut Methods](#shorcut-methods)
   - [azsort](#azsort)
   - [contains](#contains)
   - [containsKeys](#containskeys)
   - [distinct](#distinct)
   - [eachKey](#eachkey)
   - [keys](#keys)
   - [prettyJSON](#prettyjson)
3. [Value Test Methods](#value-test-methods)
   - [arrTypeCheck](#arrtypecheck)
   - [containsAny](#containsany)
   - [containsCheck](#containscheck)
   - [getFunctionParams](#getfunctionparams)
   - [getType](#getType)
   - [isFunction](#isfunction)
   - [keyCheck](#keyCheck)
   - [keyTest](#keytest)
   - [paramTest](#paramtest)
   - [typeCheck](#typecheck)
4. [String Methods](#string-methods)
   - [capitalize](#capitalize)
   - [getLongestKey](#getlongestkey)
   - [matchLength](#matchlength)
   - [removeTrailingSpaces](#removetrailingspaces)
   - [stringify](#stringify)
5. [Encoding Methods](#encoding-methods)
   - [hclEncode](#hclEncode)
6. [CLI Utility Methods](#cli-utility-methods)
   - [flagTest](#flagtest)
   - [flagValues]
   - [getVerbActions](#getVerbActions)
   - [replaceOptionalFlags](#replaceoptionalflags)
7. [Contributing](#contributing)
8. [Code Test Coverage](#code-test-coverage)

---

## Installation

```shell
npm i lazy-z
```

---

## Shorcut Methods

### azsort

Callback function for the `sort` command to order strings from a to z

```js
const { azsort } = require("lazy-z");

["frog", "egg", "todd", "help"].sort(azsort);

// returns
["egg", "frog", "help", "todd"];
```

### contains

Shortcut to check if string or array of strings contains a value

```js
const { contains } = require("lazy-z");

contains("egg nog", "egg");

// returns
true;

contains(["egg", "nog"], "egg");
// returns
true;
```

### containsKeys

Check to see if an object contains a key

```js
const { containsKeys } = require("lazy-z");

containsKeys({ one: 1, two: 2 }, "one");
// returns
true;
```

### distinct

Returns all distinct entries in an array of strings

```js
const { disctinct } = require("lazy-z");

distinct(["c", "a", "b", "b", "a", "g", "e"])[
  // returns
  ("c", "a", "b", "g", "e")
];
```

### eachKey

Shortcut for `Object.keys(object).forEach(i => {})`

```js
const { eachKey } = require("lazy-z");

eachKey({ one: 1, two: 2 }, (key, index) => {
  console.log(key + " " + index);
});
```

### keys

Get the keys of an object

```js
const { keys } = require("lazy-z");
keys({ one: 1, two: 2 })[
  // returns
  ("one", "two")
];
```

### prettyJSON

Shortcut for JSON.stringify(obj, null, 2)

```js
const { prettyJSON } = require("lazy-z");

prettyJSON({ one: 1, two: 2 });

// returns string
`{
    "one" : 1,
    "two" : 2,
}`;
```

---

## Value Test Methods

The following methods evaluate values

### arrTypeCheck

Check all items in an array for a specific type. Will throw an error if types do not match

```js

const { arrTypeCheck } = require("lazy-z");

arrTypeCheck("array expected all elements to be", "string", ["one", 2])

// throws
`array expected all elements to be type string got ["string", "number"]

```

### containsAny

Checks to see if any instances of string from one array are found in another array of string

```js
const { containsAny } = require("lazy-z");

containsAny(["a"], ["b"]);
// returns
false;

containsAny(["b", "c", "d", "e"], ["b"]);
// returns
true;
```

### containsCheck

Test to see if an array of strings contains a value. Throw an error if not in the array

```js
const { containsCheck } = require("lazy-z");

containsCheck(
  "should contain the number 4",
  ["frog", "string", "egg"],
  "4"
) // throws
`should contain the number 4 got ["frog", "string", "egg"]`;
```

### getFunctionParams

Get a list of the names of parameters for a function

```js
const { getFunctionParams } = require("lazy-z");

function test(one, two, three, four) {}

getFunctionParams(test)[
  // returns
  ("one", "two", "three", "four")
];
```

### getType

Get the type of a value, evaluates to `string`, `number`, `object`, `boolean`, `Array`, or `Function`

```js
const { getType } = require("lazy-z");

getType(getType);
// returns
("Function");

getType([]);
// returns
("Array");

getType({});
// returns
("object");
```

### isFunction

Returns true if a value is a function

```js
const { isFunction } = require("lazy-z");

isFunction("string"); // returns false
isFunction(isFunction); // returns true
```

### keyCheck

Throw an error when an object does not have needed keys

```js
/**
 * Check an object for correct keys
 * @param {string} message Display message
 * @param {Object} value Value to check
 * @param {Array<string>} keys Keys to check for
 * @param {boolean?} strict Check to ensure only keys are present, otherwise non-present keys are ok
 * @throws if keys do not match
 */
function keyCheck(message, value, checkKeys, strict)


const { keyCheck } = require("lazy-z");

keyCheck("test expects to have the correct params", { foo: "baz" }, ["frog"]);
// throws
'test expects to have the correct params ["frog"] got ["foo"]'
```

### keyTest

Test to see if an object has needed keys

```js
/**
 * Test to see if an object has needed keys
 * @param {Object} value Value to check
 * @param {Array<string>} keys Keys to check for
 * @param {boolean?} strict Check to ensure only keys are present, otherwise non-present keys are ok
 * @returns {boolean} True if all params match
 */
function keyTest(value, checkKeys, strict)

const { keyTest } = require("lazy-z");

keyTest({foo: "baz"}, ["foo"]); // returns true
keyTest({foo: "baz", bar: "bar"}, ["foo"], true); // returns false
keyTest({foo: "baz", bar: "bar"}, ["foo", bar], true); // returns true
```

### paramTest

A shortcut functions that takes in a functions and checks for parameter types. Will throw an error for mismatched types. Types can be `string`, `number`, `object`, `boolean`, `Array`, or `Function`.

```js
const { paramTest } = require("lazy-z");

function example(str, bool, arr, num) {
  paramTest(example, arguments, {
    str: "string",
    bool: "boolean",
    arr: "Array<string>",
    num: "number",
  });
}
```

### typeCheck

Checks a value type and throws an error if the type does not match. Acceptect types are `string`, `number`, `object`, `boolean`, `Array`, and `Function`.

```js
const { typeCheck } = require("lazy-z");

typeCheck(
  "expects value to be type",
  "string",
  1
) // throws an error
`expects value to be type string got number`;
```

---

## String Methods

Methods for dealing with strings

### capitalize

Capitalize the first character of a string

```js
const { capitalize } = require("lazy-z");

capitalize("help");
// returns
("Help");
```

### getLongestKey

Get the length of the longest key from an object

```js
const { getLongestKey } = require("lazy-z");

getLongestKey({ a: true, bb: false, ccc: true });
// returns
3;
```

### matchLength

Match the length of a string to a number by appending spaces

```js
const { matchLength } = require("lazy-z");

matchLength("help", 12);
// returns
("help        ");
```

### removeTrailingSpaces

```js
const { removeTrailingSpaces } = require("lazy-z");

removeTrailingSpaces("help        ");
// returns
("help");
```

### stringify

Create a string from any data type

```js
const { stringify } = require("lazy-z");

stringify(
  stringify
) // returns
`function stringify(data) {
  let dataType = getType(data);
  if (dataType === "Function") return data.toString();
  if (dataType === "Array" || dataType === "object") return prettyJSON(data);
  else return \`\${data}\`;
}`;
```

## Encoding Methods

Methods that transform data

### hclEncode

Create HCL from JSON data

```js
/**
 * Create HCL from JSON data as a .tfvars file
 * @param {Object} jsonObject object data to transpose
 * @param {boolean} objectMode Return formatted as a single hcl object instead of as tfvars
 * @returns {string} HCL encoded data
 */
function hclEncode(jsonObject, objectMode)
```

Example:

```js
const { hclEncode } = require("lazy-z");

hclEncode(
  {
    virtual_private_endpoints: [
      {
        service_name: "cos",
        service_type: "cloud-object-storage",
        resource_group: "slz-service-rg",
        vpcs: [
          {
            name: "management",
            subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
          },
          {
            name: "workload",
            subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"],
          },
        ],
      },
    ],
  },
  true
);

// returns
`{
  virtual_private_endpoints = [
    {
      service_name   = "cos"
      service_type   = "cloud-object-storage"
      resource_group = "slz-service-rg"
      vpcs           = [
        {
          name    = "management"
          subnets = ["vpe-zone-1","vpe-zone-2","vpe-zone-3"]
        }
        {
          name    = "workload"
          subnets = ["vpe-zone-1","vpe-zone-2","vpe-zone-3"]
        }
      ]
    }
  ]
}`;
```

## CLI Utility Methods

Utilities for CLI tools. `flagValues` is the main method, each other CLI Utility Method is used by `flagValues`.

---

### flagValues

Create key value pairs from list of command arguments

```js
/**
 * Create key value pairs from list of command arguments
 * @param {string} command name of command
 * @param {Object} action action
 * @param {Array} action.requiredFlags Flags required by the action
 * @param {?Array} action.optionalFlags Optional flags
 * @param {Object} tags key value pair of tags
 * @param  {...any} commandArgs command line arguments
 * @returns {Object} object containing key value pairs of params from tags
 */
function flagValues(command, action, tags, ...commandArgs)
```

Example use:

```js
// command name
let command = "plan";

// parameters needed for plan
let planParameters = {
  requiredFlags: ["in", "out", "type"],
  optionalFlags: [
    {
      name: "tfvars",
      allowMultiple: true,
    },
  ],
};

// map of valid tags with aliases
let tags = {
  help: ["-h", "--help"],
  in: ["-i", "--in"],
  out: ["-o", "--out"],
  type: ["-t", "--type"],
  tfvars: ["-v", "--tf-var"],
}

flagValues(
  command,
  planParameters,
  tags,
  "--in",
  "./in-file-path/",
  "--out",
  "./out-file.test.js",
  "--tf-var",
  "tfx",
  "--tf-var",
  "testVar1=true",
  "--tf-var",
  'testVar2="true"'
)

// returns
 {
  in: "./in-file-path/",
  out: "./out-file.test.js",
  type: "tfx",
  tfvars: ["testVar1=true", 'testVar2="true"']
}

```

---

### flagTest

Test for invalid or duplicate required flags

```js
/**
 * Test for invalid or duplicate required flags
 * @param {string} command name of the command
 * @param {Object} aliases key map of key with allowed synonyms
 * @param  {...any} commandArgs List of arguments
 * @throws if any values are duplicates. strings are thrown to allow custom user error handling
 */
function flagTest(command, aliases, ...commandArgs)
```

Example use:

```js

const { flagTest } = require("lazy-z");

flagTest(
  "help"
  {
    "-h": "--help",
    "--help": "-h",
  },
  "-h",
  "-h"
)

// throws
"Invalid duplicate flag -h"

```

---

### getVerbActions

Create a list of all available flags and aliases for a command

```js
/**
 * Get actions from a verb object
 * @param {Object} action action
 * @param {Array} action.requiredFlags Flags required by the action
 * @param {Array} action.optionalFlags Optional flags
 * @param {Object} tags tags object
 * @returns {Object} Aliases for the verb
 */
function getVerbActions(action, tags)
```

Example use:

```js
let plan = {
  requiredFlags: ["in", "out", "type"],
  optionalFlags: [
    {
      name: "tfvar",
      allowMultiple: true,
    },
    {
      name: "shallow"
    }
  ],
};
let tags = {
  help: ["-h", "--help"],
  in: ["-i", "--in"],
  out: ["-o", "--out"],
  type: ["-t", "--type"],
  tfvar: ["-v", "--tf-var"],
  shallow: ["-s", "--shallow"]
};

getVerbActions(plan, tags)

// returns
{
  "-i": "--in",
  "--in": "-i",
  "-o": "--out",
  "--out": "-o",
  "-t": "--type",
  "--type": "-t",
  "?*-v": "?*--tf-var",
  "?*--tf-var": "?*-v",
  "?-s" | "?--shallow",
  "?--shallow" | "?-s"
};
```
---

### replaceOptionalFlags

Replace literal optional arguments by prepending `?*` for multiple optional arguments and `?` for optional arguments.

```js
/**
 * Replace optional flags from command args to denote multiple and optional flags
 * @param {Object} action action
 * @param {Array} action.requiredFlags Flags required by the action
 * @param {?Array} action.optionalFlags Optional flags
 * @param {Object} tags tags object
 * @param  {...any} commandArgs List of arguments
 * @returns {Array<string} Modified list of commang args
 */
function replaceOptionalFlags(action, tags, ...commandArgs)
```

Example use: 

```js
let commandFlags = {
  requiredFlags: ["in", "out", "type"],
  optionalFlags: [
    {
      name: "tfvar",
      allowMultiple: true,
    },
    {
      name: "shallow"
    }
  ],
};

let tags = {
  help: ["-h", "--help"],
  in: ["-i", "--in"],
  out: ["-o", "--out"],
  type: ["-t", "--type"],
  tfvar: ["-v", "--tf-var"],
  shallow: ["-s", "--shallow"]
};

replaceOptionalFlags(commandFlags, tags, "--in", "file_path", "--shallow")

// returns
["--in", "file_path", "?--shallow"]
```

---

## Contributing

If you have any questions or issues you can create a new [issue here][issues]. See the full contribution guidelines [here](./CONTRIBUTING.md). 

This repo uses [Prettier JS](https://prettier.io/) for formatting. We recommend using the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).

Pull requests are very welcome! Make sure your patches are well tested.
Ideally create a topic branch for every separate change you make. For
example:

1. Fork the repo
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

---

## Code Test Coverage

File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------|---------|----------|---------|---------|-------------------
All files     |     100 |      100 |     100 |     100 | 🏆                 
 cli-utils.js |     100 |      100 |     100 |     100 | 🏆                   
 encode.js    |     100 |      100 |     100 |     100 | 🏆                   
 shortcuts.js |     100 |      100 |     100 |     100 | 🏆                   
 strings.js   |     100 |      100 |     100 |     100 | 🏆                   
 values.js    |     100 |      100 |     100 |     100 | 🏆                   
