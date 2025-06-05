import * as fs from "fs";
import * as path from "path";
import * as prettier from "prettier";

const DEPLOYMENTS_DIR = path.resolve("deployments");
const TARGET_PATH = path.resolve("generated", "deployedContracts.ts");

const TESTNET_PREFIXES = [
  "sepolia",
  "mumbai",
  "scrollSepolia",
  "baseSepolia",
  "arbitrumSepolia",
  "polygonMumbai",
  "lineaSepolia",
];
const MAINNET_PREFIXES = ["mainnet", "ethereum", "polygon", "arbitrum", "base", "scroll", "linea"];

function classifyNetwork(name: string): "testnet" | "mainnet" | "other" {
  const lower = name.toLowerCase();
  if (TESTNET_PREFIXES.some(p => lower.includes(p))) return "testnet";
  if (MAINNET_PREFIXES.some(p => lower === p)) return "mainnet";
  return "other";
}

function getDeploymentData(): Record<"testnet" | "mainnet", Record<string, any>> {
  const result = {
    testnet: {} as Record<string, any>,
    mainnet: {} as Record<string, any>,
  };

  for (const network of fs.readdirSync(DEPLOYMENTS_DIR)) {
    const networkPath = path.join(DEPLOYMENTS_DIR, network);
    const stats = fs.statSync(networkPath);
    if (!stats.isDirectory()) continue;

    const contracts: Record<string, { address: string; abi: any }> = {};

    for (const file of fs.readdirSync(networkPath)) {
      if (!file.endsWith(".json")) continue;

      const filePath = path.join(networkPath, file);
      const { address, abi } = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const contractName = path.basename(file, ".json");
      contracts[contractName] = { address, abi };
    }

    const category = classifyNetwork(network);
    if (category === "testnet" || category === "mainnet") {
      result[category][network] = contracts;
    } else {
      console.warn(`⚠️  Skipping unknown network category for "${network}"`);
    }
  }

  return result;
}

function generateTsModule(data: Record<string, any>): string {
  return `const deployedContracts = ${JSON.stringify(data, null, 2)} as const;

export default deployedContracts;
`;
}

async function writeOutputFile(contents: string) {
  fs.mkdirSync(path.dirname(TARGET_PATH), { recursive: true });
  const formatted = await prettier.format(contents, { parser: "typescript" });
  fs.writeFileSync(TARGET_PATH, formatted);
  console.log(`✅ Wrote: ${TARGET_PATH}`);
}

async function main() {
  const data = getDeploymentData();
  const tsCode = generateTsModule(data);
  await writeOutputFile(tsCode);
}

main().catch(err => {
  console.error("❌ Failed to generate deployed contracts:", err);
});
