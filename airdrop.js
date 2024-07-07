import { connection } from "./connection.js";
import "dotenv/config"
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { payer } from "./keypair.js";


// Getting the balance before the airdrop
let balance = await connection.getBalance(payer)

console.log("balance before ", balance/LAMPORTS_PER_SOL, "sol");


// requesting the airdrop
const airdropSignature = await connection.requestAirdrop(
    payer,
    100 * LAMPORTS_PER_SOL
  );
  
  await connection.confirmTransaction(airdropSignature)

  //balance after airdrop
  balance = await connection.getBalance(payer)
console.log("balance after ", balance/LAMPORTS_PER_SOL,"sol");
