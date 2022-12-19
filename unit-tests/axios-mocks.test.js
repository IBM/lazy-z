const { assert } = require("chai");
const sinon = require("sinon");
const mockAxios = require("../lib/axios-mocks");

describe("axios", () => {
  describe("main function", () => {
    it("should return a promise when called with params on resolve", () => {
      let { axios } = mockAxios({ data: true });
      return axios({ params: "yes" }).then((data) => {
        assert.isTrue(data.data.data, "it should be true");
      });
    });
    it("should reject when error is true", () => {
      let { axios } = mockAxios({ data: true }, true);
      return axios({ params: "yes" }).catch((data) => {
        assert.isTrue(data.data, "it should be true");
      });
    });
  });
  describe("get function", () => {
    it("should return a promise when called with params on resolve", () => {
      let { axios } = mockAxios({ data: true });
      return axios.get({ params: "yes" }).then((data) => {
        assert.isTrue(data.data.data, "it should be true");
      });
    });
  });
});
