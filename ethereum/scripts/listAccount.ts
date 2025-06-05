import * as dotenv from "dotenv";
dotenv.config();

import { HDNodeWallet, ethers } from "ethers";
import QRCode from "qrcode";

const RPC_URLS: Record<string, string> = {
  sepolia: "",
  polygon: "",
  arbitrum: "",
  base: "",
  scroll: "",
  linea: "",
};

async function main() {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic || mnemonic.split(" ").length < 12) {
    console.log("🚫️ You don't have a valid mnemonic. Set MNEMONIC in your .env");
    return;
  }

  const wallet = HDNodeWallet.fromPhrase(mnemonic);
  const address = wallet.address;

  console.log(await QRCode.toString(address, { type: "terminal", small: true }));
  console.log("🆔 Public address:", address, "\n");

  for (const [networkName, rpcUrl] of Object.entries(RPC_URLS)) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const balance = await provider.getBalance(address);
      const nonce = await provider.getTransactionCount(address);

      console.log(`-- ${networkName} -- 📡`);
      console.log("   Balance:", ethers.formatEther(balance), "ETH");
      console.log("   Nonce:  ", nonce);
    } catch (e) {
      if (e instanceof Error) {
        console.log(`❌ Can't connect to ${networkName}:`, e.message);
      } else {
        console.log(`❌ Can't connect to ${networkName}:`, e);
      }
    }
  }
}

main().catch(error => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
