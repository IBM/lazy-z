const { assert } = require("chai");
const {
  formatCidrBlock,
  buildNetworkingRule,
  getFirstCidrRange,
  getSecondCidrRange,
  getThirdCidrRange,
  cidrOverlap,
  getFourthCidrRange,
} = require("../lib/networking");

describe("networking", () => {
  describe("formatCidrBlock", () => {
    it("should throw an error if an incorrect zone is passed", () => {
      let task = () => formatCidrBlock(0, 4, 0);
      assert.throws(task, "Zone must be 1, 2, or 3.");
    });
    it("should format the CIDR block for edge vpc", () => {
      let actualData = formatCidrBlock(0, 1, 0, true);
      let expectedData = "10.5.10.0/24";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should create correct cidr block"
      );
    });
    it("should format the CIDR block for vpc", () => {
      let actualData = formatCidrBlock(0, 1, 0);
      let expectedData = "10.10.10.0/24";
      assert.deepEqual(
        actualData,
        expectedData,
        "it should create correct cidr block"
      );
    });
  });
  describe("getFirstCidrRange", () => {
    it("should return correct min and max if 256 ips", () => {
      let actualData = getFirstCidrRange("10.0.0.0/24", 256);
      let expectedData = {
        first: 0,
        last: 255,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max if 1024 ips starting at 13", () => {
      let actualData = getFirstCidrRange("10.0.0.13/22", 1024);
      let expectedData = {
        first: 13,
        last: 13,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max if 512 ips starting at 13", () => {
      let actualData = getFirstCidrRange("10.0.0.13/22", 512);
      let expectedData = {
        first: 13,
        last: 13,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max if 65,536 ips starting at 13", () => {
      let actualData = getFirstCidrRange("10.0.0.13/22", 65536);
      let expectedData = {
        first: 13,
        last: 13,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max if 2 ips starting at 0", () => {
      let actualData = getFirstCidrRange("10.0.0.0/31", 2);
      let expectedData = {
        first: 0,
        last: 1,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max if 2 ips starting at 3", () => {
      let actualData = getFirstCidrRange("10.0.0.3/31", 2);
      let expectedData = {
        first: 3,
        last: 4,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max if 2 ips starting at 255", () => {
      let actualData = getFirstCidrRange("10.0.0.255/31", 2);
      let expectedData = {
        first: 255,
        last: 0,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max if 4 ips starting at 255", () => {
      let actualData = getFirstCidrRange("10.0.0.255/30", 4);
      let expectedData = {
        first: 255,
        last: 2,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max if 4 ips starting at 254", () => {
      let actualData = getFirstCidrRange("10.0.0.254/30", 4);
      let expectedData = {
        first: 254,
        last: 1,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
  });
  describe("buildNetworkingRule", () => {
    it("should build the correct rule with no protocol for acl", () => {
      let expectedData = {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        icmp: {
          type: null,
          code: null,
        },
        tcp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
        udp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
      };
      let actualData = buildNetworkingRule(
        {
          name: "allow-ibm-inbound",
          allow: true,
          inbound: true,
          source: "161.26.0.0/16",
          destination: "10.0.0.0/8",
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return networking rule"
      );
    });
    it("should build the correct rule with no protocol for acl outbound/deny", () => {
      let expectedData = {
        action: "deny",
        destination: "10.0.0.0/8",
        direction: "outbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        icmp: {
          type: null,
          code: null,
        },
        tcp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
        udp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
      };
      let actualData = buildNetworkingRule(
        {
          name: "allow-ibm-inbound",
          allow: false,
          inbound: false,
          source: "161.26.0.0/16",
          destination: "10.0.0.0/8",
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return networking rule"
      );
    });
    it("should build the correct rule with icmp protocol for acl", () => {
      let expectedData = {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        icmp: {
          type: 1,
          code: 2,
        },
        tcp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
        udp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
      };
      let actualData = buildNetworkingRule(
        {
          name: "allow-ibm-inbound",
          allow: true,
          inbound: true,
          source: "161.26.0.0/16",
          destination: "10.0.0.0/8",
          ruleProtocol: "icmp",
          rule: {
            code: 2,
            type: 1,
          },
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return networking rule"
      );
    });
    it("should build the correct rule with icmp protocol for acl with only code", () => {
      let expectedData = {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        icmp: {
          type: null,
          code: 2,
        },
        tcp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
        udp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
      };
      let actualData = buildNetworkingRule(
        {
          name: "allow-ibm-inbound",
          allow: true,
          inbound: true,
          source: "161.26.0.0/16",
          destination: "10.0.0.0/8",
          ruleProtocol: "icmp",
          rule: {
            code: 2,
          },
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return networking rule"
      );
    });
    it("should build the correct rule with icmp protocol for acl with only type", () => {
      let expectedData = {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        icmp: {
          type: 2,
          code: null,
        },
        tcp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
        udp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
      };
      let actualData = buildNetworkingRule(
        {
          name: "allow-ibm-inbound",
          allow: true,
          inbound: true,
          source: "161.26.0.0/16",
          destination: "10.0.0.0/8",
          ruleProtocol: "icmp",
          rule: {
            type: 2,
          },
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return networking rule"
      );
    });
    it("should build the correct rule with tcp protocol for acl", () => {
      let expectedData = {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        icmp: {
          type: null,
          code: null,
        },
        tcp: {
          port_min: 8080,
          port_max: 8080,
          source_port_min: 443,
          source_port_max: 443,
        },
        udp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
      };
      let actualData = buildNetworkingRule(
        {
          name: "allow-ibm-inbound",
          allow: true,
          inbound: true,
          source: "161.26.0.0/16",
          destination: "10.0.0.0/8",
          ruleProtocol: "tcp",
          rule: {
            port_min: 8080,
            port_max: 8080,
            source_port_min: 443,
            source_port_max: 443,
          },
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return networking rule"
      );
    });
    it("should build the correct rule with tcp protocol for acl with only port min", () => {
      let expectedData = {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        icmp: {
          type: null,
          code: null,
        },
        tcp: {
          port_min: 8080,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
        udp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
      };
      let actualData = buildNetworkingRule(
        {
          name: "allow-ibm-inbound",
          allow: true,
          inbound: true,
          source: "161.26.0.0/16",
          destination: "10.0.0.0/8",
          ruleProtocol: "tcp",
          rule: {
            port_min: 8080,
          },
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return networking rule"
      );
    });
    it("should build the correct rule with tcp protocol for acl with only port max", () => {
      let expectedData = {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        icmp: {
          type: null,
          code: null,
        },
        tcp: {
          port_min: null,
          port_max: 8080,
          source_port_min: null,
          source_port_max: null,
        },
        udp: {
          port_min: null,
          port_max: null,
          source_port_min: null,
          source_port_max: null,
        },
      };
      let actualData = buildNetworkingRule(
        {
          name: "allow-ibm-inbound",
          allow: true,
          inbound: true,
          source: "161.26.0.0/16",
          destination: "10.0.0.0/8",
          ruleProtocol: "tcp",
          rule: {
            port_max: 8080,
          },
        },
        true
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return networking rule"
      );
    });
    it("should build the correct rule with no protocol for security group", () => {
      let expectedData = {
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
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
      };
      let actualData = buildNetworkingRule({
        name: "allow-ibm-inbound",
        allow: true,
        inbound: true,
        source: "161.26.0.0/16",
        destination: "10.0.0.0/8",
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return networking rule"
      );
    });
    it("should build the correct rule with tcp protocol for security group", () => {
      let expectedData = {
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        icmp: {
          type: null,
          code: null,
        },
        tcp: {
          port_min: 443,
          port_max: 443,
        },
        udp: {
          port_min: null,
          port_max: null,
        },
      };
      let actualData = buildNetworkingRule({
        name: "allow-ibm-inbound",
        allow: true,
        inbound: true,
        source: "161.26.0.0/16",
        destination: "10.0.0.0/8",
        ruleProtocol: "tcp",
        rule: {
          port_max: 443,
          port_min: 443,
        },
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return networking rule"
      );
    });
  });
  describe("getSecondCidrRange", () => {
    it("should return correct min and max for 2 ips starting at 254", () => {
      let actualData = getSecondCidrRange("0.0.0.254/30", 2);
      let expectedData = {
        first: 0,
        last: 1,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max for 2 ips starting at 254", () => {
      let actualData = getSecondCidrRange("0.0.255.254/30", 2);
      let expectedData = {
        first: 255,
        last: 0,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max for 512 ips starting at 0", () => {
      let actualData = getSecondCidrRange("10.0.0.0/23", 512);
      let expectedData = {
        first: 0,
        last: 1,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max if 2 ips starting at 0", () => {
      let actualData = getSecondCidrRange("10.0.0.0/31", 2);
      let expectedData = {
        first: 0,
        last: 0,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max for 512 ips starting at 255", () => {
      let actualData = getSecondCidrRange("10.0.0.255/23", 512);
      let expectedData = {
        first: 0,
        last: 1,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max for 1024 ips starting at 255", () => {
      let actualData = getSecondCidrRange("10.0.0.255/22", 1024);
      let expectedData = {
        first: 0,
        last: 3,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
  });
  describe("getThirdCidrRange", () => {
    it("should return correct min and max for 131072 ips starting at 0", () => {
      let actualData = getThirdCidrRange("10.0.0.0/8", 131072);
      let expectedData = {
        first: 0,
        last: 1,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max if 2 ips starting at 0", () => {
      let actualData = getThirdCidrRange("10.0.0.0/31", 2);
      let expectedData = {
        first: 0,
        last: 0,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max if 2 ips starting at 255", () => {
      let actualData = getThirdCidrRange("10.0.255.255/31", 2);
      let expectedData = {
        first: 0,
        last: 1,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max for 131072 ips starting at 255", () => {
      let actualData = getThirdCidrRange("10.0.0.255/15", 131072);
      let expectedData = {
        first: 0,
        last: 1,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
  });
  describe("getFourthCidrRange", () => {
    it("should return correct min and max if 2 ips starting at 0", () => {
      let actualData = getFourthCidrRange("10.0.0.0/31", 2);
      let expectedData = {
        first: 10,
        last: 10,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max if 2 ips starting at 255", () => {
      let actualData = getFourthCidrRange("10.255.255.255/31", 2);
      let expectedData = {
        first: 10,
        last: 11,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max for 33554432 ips starting at 0", () => {
      let actualData = getFourthCidrRange("10.0.0.0/7", 33554432);
      let expectedData = {
        first: 10,
        last: 11,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
    it("should return correct min and max for 33554432 ips starting at 255", () => {
      let actualData = getFourthCidrRange("10.0.0.255/7", 33554432);
      let expectedData = {
        first: 10,
        last: 11,
      };
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct range"
      );
    });
  });
  describe("cidrOverlap", () => {
    it("should return true if two /32 cidr blocks overlap", () => {
      assert.isTrue(
        cidrOverlap("10.10.10.10/32", "10.10.10.10/32"),
        "it should return true"
      );
    });
    it("should return false if two /32 cidr blocks do not overlap", () => {
      assert.isFalse(
        cidrOverlap("10.10.10.11/32", "10.10.10.10/32"),
        "it should return false"
      );
    });
    it("should return false if two cidr blocks with > /7 and different first bits overlap by checking first digit", () => {
      assert.isFalse(
        cidrOverlap("11.10.10.10/30", "10.10.10.10/32"),
        "it should return false"
      );
    });
    it("should return false if two cidr blocks with > /16 and different first bits overlap by checking second digit", () => {
      assert.isFalse(
        cidrOverlap("10.11.10.10/16", "10.10.10.10/16"),
        "it should return false"
      );
    });
    it("should return true if two /30 cidr blocks overlap", () => {
      assert.isTrue(
        cidrOverlap("0.0.0.0/30", "0.0.0.2/30"),
        "it should be true"
      );
    });
    it("should return false if two /30 cidr blocks do not overlap", () => {
      assert.isFalse(
        cidrOverlap("0.0.0.15/30", "0.0.0.2/30"),
        "it should be false"
      );
    });
    it("should return true if two /30 cidr blocks overlap", () => {
      assert.isTrue(
        cidrOverlap("0.0.0.2/30", "0.0.0.0/30"),
        "it should be true"
      );
    });
    it("should return true if two /30 cidr blocks overlap", () => {
      assert.isTrue(
        cidrOverlap("0.0.0.2/30", "0.0.0.3/30"),
        "it should be true"
      );
    });
    it("should return true if two /30 cidr blocks overlap", () => {
      assert.isTrue(
        cidrOverlap("0.0.0.3/30", "0.0.0.2/30"),
        "it should be true"
      );
    });
    it("should return true if two /30 cidr blocks starting at ~255 overlap", () => {
      assert.isTrue(
        cidrOverlap("0.0.0.254/30", "0.0.0.255/30"),
        "it should be true"
      );
    });
    it("should return false if two /30 cidr blocks starting at ~255 do not overlap", () => {
      assert.isFalse(
        cidrOverlap("0.0.0.250/30", "0.0.0.255/30"),
        "it should be false"
      );
    });
    it("should return true if two /30 cidr blocks starting at ~255 overlap", () => {
      assert.isTrue(
        cidrOverlap("0.0.255.254/30", "0.0.255.255/30"),
        "it should be true"
      );
    });
    it("should return true if two /30 cidr blocks starting at ~255 overlap", () => {
      assert.isTrue(
        cidrOverlap("0.0.0.255/30", "0.0.0.254/30"),
        "it should be true"
      );
    });
    it("should return true if two /30 cidr blocks starting at ~255 overlap", () => {
      assert.isTrue(
        cidrOverlap("0.0.255.255/30", "0.0.255.254/30"),
        "it should be true"
      );
    });
    it("should return true if two /23 cidr blocks starting at ~255 overlap", () => {
      assert.isTrue(
        cidrOverlap("0.0.255.255/23", "0.0.255.254/23"),
        "it should be true"
      );
    });
    it("should return true if two /23 cidr blocks starting at ~255 overlap", () => {
      assert.isTrue(
        cidrOverlap("0.0.255.10/23", "0.0.255.19/23"),
        "it should be true"
      );
    });
    it("should return false if two /23 cidr blocks starting at ~255 overlap", () => {
      assert.isFalse(
        cidrOverlap("0.0.100.10/23", "0.0.255.19/23"),
        "it should be false"
      );
    });
    it("should return true if two /16 cidr blocks starting at ~255 overlap", () => {
      assert.isTrue(
        cidrOverlap("0.0.255.0/16", "0.0.254.254/1"),
        "it should be true"
      );
    });
    it("should return true to the overlapping cidr blocks", () => {
      let testCidrA = "192.168.0.1/24";
      let testCidrB = "192.168.0.1/18";
      let actualResp = cidrOverlap(testCidrA, testCidrB);
      assert.deepEqual(actualResp, true);
    });
    it("should return false to the non-overlapping cidr blocks", () => {
      let testCidrA = "192.168.0.1/24";
      let testCidrB = "10.0.0.0/16";
      let actualResp = cidrOverlap(testCidrA, testCidrB);
      assert.deepEqual(actualResp, false);
    });
    it("should return true since they are the same cidr blocks", () => {
      let testCidr = "10.0.0.0/16";
      let actualResp = cidrOverlap(testCidr, testCidr);
      assert.deepEqual(actualResp, true);
    });
    it("should return false to the non-overlapping cidr blocks", () => {
      let testCidrA = "10.0.0.0/16";
      let testCidrB = "192.168.0.1/24";
      let actualResp = cidrOverlap(testCidrA, testCidrB);
      assert.deepEqual(actualResp, false);
    });
  });
});
