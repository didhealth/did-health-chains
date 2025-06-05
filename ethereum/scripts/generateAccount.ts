import { HDNodeWallet } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const mnemonic = process.env.MNEMONIC;

if (!mnemonic || mnemonic.split(" ").length < 12) {
  throw new Error("Missing or invalid MNEMONIC in .env");
}

const wallet = HDNodeWallet.fromPhrase(mnemonic);
console.log("Your deployer address is:", wallet.address);
