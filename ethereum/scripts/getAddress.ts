import { HDNodeWallet } from "ethers";
import * as dotenv from "dotenv";

// Load .env
console.log("🟡 Loading environment...");
dotenv.config();

const mnemonic = process.env.MNEMONIC;

if (!mnemonic) {
  console.error("❌ Error: MNEMONIC not set in .env");
  process.exit(1);
}

console.log("✅ MNEMONIC loaded");

// Generate wallet from mnemonic
let wallet;
try {
  wallet = HDNodeWallet.fromPhrase(mnemonic);
} catch (err) {
  console.error("❌ Failed to generate wallet from mnemonic:", err);
  process.exit(1);
}

console.log("🧠 Wallet generated successfully");
console.log("📬 Your deployer address is:", wallet.address);
