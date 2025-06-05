import { ethers } from "ethers";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

const MNEMONIC = process.env.MNEMONIC;
if (!MNEMONIC) {
  throw new Error("❌ MNEMONIC environment variable is not set in .env");
}

// 🔧 Load RPCs from .env
const TESTNET_RPC_URLS = {
  sepolia: process.env.RPC_SEPOLIA!,
  polygonMumbai: process.env.RPC_POLYGON!,
  arbitrumSepolia: process.env.RPC_ARBITRUM!,
  baseSepolia: process.env.RPC_BASE!,
  scrollSepolia: process.env.RPC_SCROLL!,
  lineaSepolia: process.env.RPC_LINEA!,
};

const MAINNET_RPC_URLS = {
  ethereum: process.env.RPC_MAINNET!,
  polygon: process.env.RPC_POLYGON_MAINNET!,
  arbitrum: process.env.RPC_ARBITRUM_MAINNET!,
  base: process.env.RPC_BASE_MAINNET!,
  scroll: process.env.RPC_SCROLL_MAINNET!,
  linea: process.env.RPC_LINEA_MAINNET!,
};

const contractsToDeploy = [
  { name: "YourContract", args: (signerAddress: string) => [signerAddress] },
  { name: "HealthDIDRegistry", args: () => [] },
];

async function deployToNetworks(rpcMap: Record<string, string>, label: string) {
  const wallet = ethers.HDNodeWallet.fromPhrase(MNEMONIC as string);

  for (const [network, rpcUrl] of Object.entries(rpcMap)) {
    if (!rpcUrl) {
      console.warn(`⚠️  Skipping ${label} network "${network}" — no RPC URL set in .env`);
      continue;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = wallet.connect(provider);
    const signerAddress = await signer.getAddress();

    console.log(`\n🚀 Deploying to ${label}: ${network} with ${signerAddress}...`);

    const deployedContracts: Record<string, { address: string; abi: any }> = {};

    for (const contract of contractsToDeploy) {
      const artifactPath = `./out/${contract.name}.sol/${contract.name}.json`;
      if (!fs.existsSync(artifactPath)) {
        console.error(`❌ Missing compiled artifact for ${contract.name} at ${artifactPath}`);
        continue;
      }

      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
      const instance = await factory.deploy(...contract.args(signerAddress));
      await instance.waitForDeployment();
      const address = await instance.getAddress();

      console.log(`✅ ${contract.name} deployed at ${address}`);
      deployedContracts[contract.name] = { address, abi: artifact.abi };
    }

    const outDir = `./deployments/${network}`;
    fs.mkdirSync(outDir, { recursive: true });
    for (const [name, { address, abi }] of Object.entries(deployedContracts)) {
      fs.writeFileSync(`${outDir}/${name}.json`, JSON.stringify({ address, abi }, null, 2));
    }
  }
}

async function main() {
  await deployToNetworks(TESTNET_RPC_URLS, "testnet");
  await deployToNetworks(MAINNET_RPC_URLS, "mainnet");
}

main().catch(error => {
  console.error("❌ Deployment error:", error);
  process.exit(1);
});
