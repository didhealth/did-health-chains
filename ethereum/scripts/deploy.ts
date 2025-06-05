import { ethers } from "ethers"
import * as fs from "fs"
import * as dotenv from "dotenv"
dotenv.config()

const MNEMONIC = process.env.MNEMONIC

const RPC_URLS = {
  sepolia: process.env.RPC_SEPOLIA!,
  polygon: process.env.RPC_POLYGON!,
  arbitrum: process.env.RPC_ARBITRUM!,
  base: process.env.RPC_BASE!,
  scroll: process.env.RPC_SCROLL!,
  linea: process.env.RPC_LINEA!,
}

const contractsToDeploy = [
  { name: "YourContract", args: (signer: string) => [signer] },
  { name: "HealthDIDRegistry", args: () => [] },
]

async function deployToAllNetworks() {
  if (!MNEMONIC) {
    throw new Error("MNEMONIC environment variable is not set")
  }
  const wallet = ethers.HDNodeWallet.fromPhrase(MNEMONIC)

  for (const [network, rpcUrl] of Object.entries(RPC_URLS)) {
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const signer = wallet.connect(provider)
    const signerAddress = await signer.getAddress()

    const deployedContracts: Record<string, { address: string; abi: any }> = {}

    console.log(`\n🚀 Deploying to ${network} with ${signerAddress}...`)

    for (const contract of contractsToDeploy) {
      const artifact = JSON.parse(
        fs.readFileSync(`./out/${contract.name}.sol/${contract.name}.json`, "utf8")
      )
      const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer)
      const instance = await factory.deploy(...contract.args(signerAddress))
      await instance.waitForDeployment()
      const address = await instance.getAddress()
      console.log(`✅ ${contract.name} deployed at ${address}`)
      deployedContracts[contract.name] = { address, abi: artifact.abi }
    }

    const outDir = `./deployments/${network}`
    fs.mkdirSync(outDir, { recursive: true })
    for (const [name, { address, abi }] of Object.entries(deployedContracts)) {
      fs.writeFileSync(`${outDir}/${name}.json`, JSON.stringify({ address, abi }, null, 2))
    }
  }
}

deployToAllNetworks().catch(console.error)
