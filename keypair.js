import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { PublicKey } from "@solana/web3.js";


// setting the keypair from environment 
export const keypair = getKeypairFromEnvironment("SECRET_KEY")
export const payer = new PublicKey(keypair.publicKey);