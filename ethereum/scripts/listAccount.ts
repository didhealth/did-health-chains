import * as dotenv from "dotenv";
dotenv.config();

import { HDNodeWallet, ethers } from "ethers";
import QRCode from "qrcode";

// 🔧 Load from environment
const TESTNETS: Record<string, string> = {
  sepolia: process.env.RPC_SEPOLIA || "",
  polygonMumbai: process.env.RPC_POLYGON || "",
  arbitrumSepolia: process.env.RPC_ARBITRUM || "",
  baseSepolia: process.env.RPC_BASE || "",
  scrollSepolia: process.env.RPC_SCROLL || "",
  lineaSepolia: process.env.RPC_LINEA || "",
};

const MAINNETS: Record<string, string> = {
  ethereum: process.env.RPC_MAINNET || "",
  polygon: process.env.RPC_POLYGON_MAINNET || "",
  arbitrum: process.env.RPC_ARBITRUM_MAINNET || "",
  base: process.env.RPC_BASE_MAINNET || "",
  scroll: process.env.RPC_SCROLL_MAINNET || "",
  linea: process.env.RPC_LINEA_MAINNET || "",
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

  console.log("🌐 Testnets:\n");
  await queryNetworks(TESTNETS, address);

  console.log("\n🌍 Mainnets:\n");
  await queryNetworks(MAINNETS, address);
}

async function queryNetworks(rpcs: Record<string, string>, address: string) {
  for (const [networkName, rpcUrl] of Object.entries(rpcs)) {
    if (!rpcUrl) {
      console.log(`⚠️  ${networkName}: No RPC URL configured`);
      continue;
    }

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const balance = await provider.getBalance(address);
      const nonce = await provider.getTransactionCount(address);

      console.log(`-- ${networkName} -- 📡`);
      console.log("   Balance:", ethers.formatEther(balance), "ETH");
      console.log("   Nonce:  ", nonce);
    } catch (e) {
      console.log(`❌ Can't connect to ${networkName}:`, e instanceof Error ? e.message : e);
    }
  }
}

main().catch(error => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
