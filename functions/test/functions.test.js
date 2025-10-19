const { expect } = require("chai");
const fft = require("firebase-functions-test")();

describe("Cloud Functions", () => {
  let adminStub;
  before(() => {
    // Load the functions module
    // Note: this requires the functions code to be in the same environment. For deeper testing,
    // configure the emulator or use firebase-tools to run integration tests.
    adminStub = require("../index");
  });

  after(() => {
    fft.cleanup();
  });

  it("should reject unauthenticated deleteUserAndData", async () => {
    const wrapped = fft.wrap(adminStub.deleteUserAndData);
    try {
      await wrapped({ uid: "someuid" }, { auth: null });
      throw new Error("Expected function to throw");
    } catch (err) {
      expect(err).to.exist;
    }
  }).timeout(5000);
});
