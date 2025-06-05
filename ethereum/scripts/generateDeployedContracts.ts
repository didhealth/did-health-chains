import * as fs from "fs";
import * as path from "path";
import * as prettier from "prettier";

const DEPLOYMENTS_DIR = path.resolve("deployments");
const TARGET_PATH = path.resolve("generated", "deployedContracts.ts");

function getDeploymentData(): Record<string, any> {
  const result: Record<string, any> = {};

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

    result[network] = contracts;
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

main();
