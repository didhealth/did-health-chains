import { expect } from "chai";
import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.RPC_LOCAL || "http://127.0.0.1:8545"; // default local node
const MNEMONIC = process.env.MNEMONIC!;

describe("YourContract (pure ethers)", function () {
  let provider: ethers.JsonRpcProvider;
  let wallet: ethers.HDNodeWallet;
  let yourContract: ethers.BaseContract;

  before(async () => {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = ethers.HDNodeWallet.fromPhrase(MNEMONIC).connect(provider);

    const { abi, bytecode } = JSON.parse(
      fs.readFileSync("out/YourContract.json", "utf8")
    );

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    yourContract = await factory.deploy(wallet.address);
    await yourContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have the right message on deploy", async function () {
      const greeting = await yourContract.getFunction("greeting")();
      expect(greeting).to.equal("Building Unstoppable Apps!!!");
    });

    it("Should allow setting a new message", async function () {
      const newGreeting = "Learn Scaffold-ETH 2! :)";
      const tx = await yourContract.setGreeting(newGreeting);
      await tx.wait();

      const greeting = await yourContract.greeting();
      expect(greeting).to.equal(newGreeting);
    });
  });
});
// The `before` function is provided by Mocha as a global, so you don't need to implement it yourself.
// You can safely remove this function from your code.
// If you want to provide your own implementation (for a custom test runner), it could look like this:

function before(fn: () => Promise<void>) {
  // In a real test environment, this would register a hook to run before tests.
  // For demonstration, we'll just call the function immediately.
  fn();
}

