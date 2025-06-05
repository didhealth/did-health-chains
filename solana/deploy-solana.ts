import * as dotenv from "dotenv";
import { Keypair, Connection, LAMPORTS_PER_SOL, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import fs from "fs";

dotenv.config();

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function deploy() {
  const secret = Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY || "[]"));
  const payer = Keypair.fromSecretKey(secret);

  // Load compiled .so file for program
  const programData = fs.readFileSync("dist/program/my_contract.so");

  // Allocate space & write the program to Solana
  const programKeypair = Keypair.generate();
  // Use `solana program deploy` or Anchor CLI instead for real deployment

  console.log("🧾 Program ID:", programKeypair.publicKey.toBase58());
}

deploy().catch(console.error);
