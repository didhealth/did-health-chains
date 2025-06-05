import * as fs from "fs"
import prettier from "prettier"

const DEPLOYMENTS_DIR = "./deployments"
const TARGET = "out/deployedContracts.ts"

function getDeploymentData() {
  const output: Record<string, any[]> = {}
  for (const chain of fs.readdirSync(DEPLOYMENTS_DIR)) {
    const files = fs.readdirSync(`${DEPLOYMENTS_DIR}/${chain}`)
    const contracts: Record<string, any> = {}
    for (const file of files) {
      const { address, abi } = JSON.parse(fs.readFileSync(`${DEPLOYMENTS_DIR}/${chain}/${file}`, "utf8"))
      contracts[file.replace(".json", "")] = { address, abi }
    }
    output[chain] = [{ name: chain, contracts }]
  }
  return output
}

async function writeTSFile(data: Record<string, any>) {
  const fileContent = Object.entries(data)
    .map(([chainId, conf]) => `${chainId}: ${JSON.stringify(conf, null, 2)}`)
    .join(",\n")
  const formatted = await prettier.format(
    `const contracts = {\n${fileContent}\n} as const;\n\nexport default contracts;`,
    { parser: "typescript" }
  )
  fs.mkdirSync(TARGET.split("/deployedContracts.ts")[0], { recursive: true })
  fs.writeFileSync(TARGET, formatted)
  console.log(`✅ Wrote: ${TARGET}`)
}

writeTSFile(getDeploymentData())
