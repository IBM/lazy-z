const { validPortRange, isInRange } = require("./numbers");
const { validIpv4Test, contains, deepEqual } = require("./shortcuts");
const { paramTest, containsCheck, zoneTest } = require("./values");

/**
 * format a cidr block with 256 ips to be calculated programatticaly
 * @param {number} vpc index of vpc within architecture
 * @param {number} zone zone, can be 1, 2, or 3
 * @param {number} tier index of subnet tier
 * @param {boolean=} isEdge is edge network
 * @returns {string} network cidr
 */
function formatCidrBlock(vpc, zone, tier, isEdge) {
  paramTest(
    "formatCidrBlock",
    "vpc",
    "number",
    vpc,
    "zone",
    "number",
    zone,
    "tier",
    "number",
    tier
  );
  zoneTest(zone);
  let zoneMultiplier = isEdge ? 4 + zone : vpc * 3 + zone + "0";
  return `10.${zoneMultiplier}.${tier + 1}0.0/24`;
}

function getCidrIps(cidr) {
  let range = parseInt(cidr.split("/")[1]);
  return 2 ** (32 - range);
}

function getFirstCidrRange(cidr, ips) {
  let splitCidr = cidr.replace(/(\/\d+$)/g, "").split(".");
  let min = parseInt(splitCidr[3]);
  let max = 0;
  if (min === 0 && ips === 256) {
    max = 256;
  } else if (ips > 256) {
    max = Math.abs(256 - (min + 1 + 256));
  } else if (min + ips >= 256) {
    max = Math.abs(256 - (min + ips));
  } else if (ips < 256) {
    max = min + ips;
  }
  return {
    first: min,
    last: max === 0 ? 0 : max - 1,
  };
}

function getSecondCidrRange(cidr, ips) {
  let splitCidr = cidr.replace(/(\/\d+$)/g, "").split(".");
  let min = parseInt(splitCidr[2]);
  let firstRange = getFirstCidrRange(cidr, ips);
  let rangeFloor =
    firstRange.first + ips > 256
      ? Math.floor((ips + firstRange.first) / 256) - 1
      : 0;
  // edge case for when big and ends on 0
  if (
    firstRange.first + ips >= 256 &&
    Math.floor((ips + firstRange.first) / 256) - 1 === 0
  ) {
    rangeFloor++;
  }
  let secondRangeMax = min + rangeFloor === 256 ? 0 : min + rangeFloor;
  return {
    first: min,
    last: secondRangeMax > 256 ? min : secondRangeMax,
  };
}

function getThirdCidrRange(cidr, ips) {
  let splitCidr = cidr.replace(/(\/\d+$)/g, "").split(".");
  let min = parseInt(splitCidr[1]);
  let firstRange = getSecondCidrRange(cidr, ips);
  let secondRangeMax =
    min +
    (firstRange.first + ips < 256 * 256
      ? 0
      : Math.floor((ips + firstRange.first) / (256 * 256)) - 1);
  // edge case for when big and ends on 0
  if (
    firstRange.first + ips >= 256 &&
    Math.floor((ips + firstRange.first) / 256) - 1 === 0
  ) {
    secondRangeMax++;
  }
  if (secondRangeMax >= 256) {
    secondRangeMax = min;
  }
  return {
    first: min,
    last: secondRangeMax,
  };
}

/**
 * create a list of numbers from first to last where max is 256
 * @param {number} first
 * @param {number} last
 * @returns {Array<number>} list of numbers
 */
function base256List(first, last) {
  let list = [first];
  while (list[list.length - 1] !== last) {
    let next = list[list.length - 1] + 1;
    if (next === 256) {
      next = 0;
    }
    list.push(next);
  }
  return list;
}

function getFourthCidrRange(cidr, ips) {
  let splitCidr = cidr.replace(/(\/\d+$)/g, "").split(".");
  let min = parseInt(splitCidr[0]);
  let firstRange = getThirdCidrRange(cidr, ips);
  let secondRangeMax =
    min +
    (firstRange.first + ips < 256 * 256 * 256
      ? 0
      : Math.floor((ips + firstRange.first) / (256 * 256 * 256)) - 1);
  // edge case for when big and ends on 0
  if (
    firstRange.first + ips >= 256 &&
    Math.floor((ips + firstRange.first) / 256) - 1 === 0
  ) {
    secondRangeMax++;
  }
  return {
    first: min,
    last: secondRangeMax,
  };
}

function cidrOverlap(cidrA, cidrB) {
  let cidrAips = getCidrIps(cidrA);
  let cidrBips = getCidrIps(cidrB);
  let splitCidrA = cidrA.replace(/(\/\d+$)/g, "").split(".");
  let splitCidrB = cidrB.replace(/(\/\d+$)/g, "").split(".");
  if (cidrA === cidrB) {
    // don't check if same
    return true;
  } else if (
    cidrAips < 33554432 &&
    cidrBips < 33554432 &&
    splitCidrA[0] !== splitCidrB[0]
  ) {
    return false;
  } else if (
    cidrAips < 131072 &&
    cidrBips < 131072 &&
    splitCidrA[1] !== splitCidrB[1]
  ) {
    return false;
  } else {
    let aRanges = [
      getFourthCidrRange(cidrA, cidrAips),
      getThirdCidrRange(cidrA, cidrAips),
      getSecondCidrRange(cidrA, cidrAips),
      getFirstCidrRange(cidrA, cidrAips),
    ];
    let bRanges = [
      getFourthCidrRange(cidrB, cidrBips),
      getThirdCidrRange(cidrB, cidrBips),
      getSecondCidrRange(cidrB, cidrBips),
      getFirstCidrRange(cidrB, cidrBips),
    ];
    // compare first range
    if (
      aRanges[0].first !== aRanges[0].last &&
      bRanges[0].first !== bRanges[0].last
    ) {
      let aCheck = base256List(aRanges[0].first, aRanges[0].last);
      return (
        contains(aCheck, bRanges[0].first) || contains(aCheck, bRanges[0].last)
      );
    } else if (
      aRanges[1].first !== aRanges[1].last &&
      bRanges[1].first !== bRanges[1].last
    ) {
      let aCheck = base256List(aRanges[1].first, aRanges[1].last);
      return (
        contains(aCheck, bRanges[1].first) || contains(aCheck, bRanges[1].last)
      );
    } else if (
      aRanges[2].first !== aRanges[2].last &&
      bRanges[2].first !== bRanges[2].last
    ) {
      let aCheck = base256List(aRanges[2].first, aRanges[2].last);
      return (
        contains(aCheck, bRanges[2].first) || contains(aCheck, bRanges[2].last)
      );
    } else if (
      aRanges[3].first !== aRanges[3].last &&
      bRanges[3].first !== bRanges[3].last
    ) {
      let aCheck = base256List(aRanges[3].first, aRanges[3].last);
      return (
        contains(aCheck, bRanges[3].first) || contains(aCheck, bRanges[3].last)
      );
    } else {
      let overlap = true;
      while (aRanges.length > 0) {
        let nextA = aRanges.shift();
        let nextB = bRanges.shift();
        overlap =
          (nextA.first === nextA.last && nextB.first === nextB.last) ||
          deepEqual(nextA, nextB);
      }
      return overlap;
    }
  }
}

/**
 * Build a networking rule
 * @param {Object} params networking rule params
 * @param {string} params.name name of acl rule
 * @param {boolean} params.allow true to allow, false to deny
 * @param {boolean} params.inbound true for inbound, false for outbound
 * @param {string} params.source cidr block or ip
 * @param {string} params.destination cidr block or ip. if creating a security group rule, use `null`
 * @param {string=} params.ruleProtocol optional. can be `icmp`, `tcp`, or `udp`
 * @param {Object=} params.rule object describing traffic rule if using rule type
 * @param {number} params.rule.code code for icmp rules
 * @param {number} params.rule.type code for icmp rules
 * @param {number} params.rule.port_min port_min for tcp and udp rules
 * @param {number} params.rule.port_max port_max for tcp and udp rules
 * @param {number} params.rule.source_port_min source_port_min for tcp and udp rules
 * @param {number} params.rule.source_port_max source_port_max for tcp and udp rules
 * @param {boolean=} isAcl is acl rule, false if is security group
 * @returns {Object} network acl object
 */
function buildNetworkingRule(params, isAcl) {
  // new networking rule
  let newRule = {
    name: params.name,
    action: params.allow ? "allow" : "deny",
    direction: params.inbound ? "inbound" : "outbound",
    icmp: {
      type: null,
      code: null,
    },
    tcp: {
      port_min: null,
      port_max: null,
    },
    udp: {
      port_min: null,
      port_max: null,
    },
    source: params.source,
  };
  // test valid cidr for source
  validIpv4Test("buildNetworkingRule params.source", params.source);
  // add additional values if is acl
  if (isAcl) {
    newRule.destination = params.destination;
    newRule.tcp.source_port_min = null;
    newRule.tcp.source_port_max = null;
    newRule.udp.source_port_min = null;
    newRule.udp.source_port_max = null;
    validIpv4Test("buildNetworkingRule params.destination", params.destination);
  } else {
    delete newRule.action;
  }
  // if is a protocol rule
  if (params.ruleProtocol && params.ruleProtocol !== "all") {
    // check that the type is valid
    containsCheck(
      "buildNetworkingRule expects rule type",
      ["icmp", "udp", "tcp"],
      params.ruleProtocol
    );
    if (params.ruleProtocol === "icmp") {
      ["type", "code"].forEach((field) =>
        setPort(params, newRule, field, "icmp", isAcl)
      );
    } else {
      ["port_min", "port_max"]
        .concat(isAcl ? ["source_port_min", "source_port_max"] : [])
        .forEach((field) =>
          setPort(params, newRule, field, params.ruleProtocol, isAcl)
        );
    }
  }

  // return object
  return newRule;
}

/**
 * set port on networking rule
 * @param {Object} params networking rule params
 * @param {string} params.name name of acl rule
 * @param {boolean} params.allow true to allow, false to deny
 * @param {boolean} params.inbound true for inbound, false for outbound
 * @param {string} params.source cidr block or ip
 * @param {string} params.destination cidr block or ip. if creating a security group rule, use `null`
 * @param {string=} params.ruleProtocol optional. can be `icmp`, `tcp`, or `udp`
 * @param {Object=} params.rule object describing traffic rule if using rule type
 * @param {number} params.rule.code code for icmp rules
 * @param {number} params.rule.type code for icmp rules
 * @param {number} params.rule.port_min port_min for tcp and udp rules
 * @param {number} params.rule.port_max port_max for tcp and udp rules
 * @param {number} params.rule.source_port_min source_port_min for tcp and udp rules
 * @param {number} params.rule.source_port_max source_port_max for tcp and udp rules
 * @param {object} newRule new rule object
 * @param {string} name name of the path to set
 * @param {string} protocol rule protocol
 * @param {boolean=} isAcl is acl rule, false if is security group
 * @returns {Object} network acl object
 */
function setPort(params, newRule, name, protocol, isAcl) {
  if (params.rule[name]) {
    validPortRange(name, params.rule[name]);
    newRule[protocol][name] = params.rule[name];
  } else {
    newRule[protocol][name] = null;
  }
}

module.exports = {
  formatCidrBlock,
  buildNetworkingRule,
  // getCidrRange,
  getFirstCidrRange,
  getSecondCidrRange,
  getThirdCidrRange,
  getFourthCidrRange,
  cidrOverlap,
};
