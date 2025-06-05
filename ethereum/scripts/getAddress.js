import { HDNodeWallet } from "ethers";
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

const mnemonic = process.env.MNEMONIC;
if (!mnemonic) throw new Error("Missing MNEMONIC");

const wallet = HDNodeWallet.fromPhrase(mnemonic);
console.log("Your deployer address is:", wallet.address);
