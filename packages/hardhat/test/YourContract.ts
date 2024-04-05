import { expect } from "chai";
import { ethers } from "hardhat";
import { YourNillionContract } from "../typechain-types";

describe("YourNillionContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let YourNillionContract: YourNillionContract;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const YourNillionContractFactory = await ethers.getContractFactory("YourNillionContract");
    YourNillionContract = (await YourNillionContractFactory.deploy(owner.address)) as YourNillionContract;
    await YourNillionContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have the right message on deploy", async function () {
      expect(await YourNillionContract.computeResult()).to.equal("Building Unstoppable Apps!!!");
    });

    it("Should allow setting a new message", async function () {
      const newComputeResult = "Learn Scaffold-ETH 2! :)";

      await YourNillionContract.setComputeResult(newComputeResult);
      expect(await YourNillionContract.computeResult()).to.equal(newComputeResult);
    });
  });
});
