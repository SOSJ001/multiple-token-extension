import { PublicKey } from "@solana/web3.js";
import { connection } from "./connection.js";
import { payer } from "./keypair.js";
import { TOKEN_2022_PROGRAM_ID, getAccount } from "@solana/spl-token";

//getting all accounts by owner

let response = await connection.getParsedTokenAccountsByOwner(payer, {
  programId: TOKEN_2022_PROGRAM_ID,
})
// console.log(response.value);
let array = response.value
for (const key in array) {
    if (Object.hasOwnProperty.call(array, key)) {
        console.log("account info ", array[key].account.data.parsed)

        console.log("token account pub ", array[key].pubkey.toBase58())
        console.log("======================================================================")
        
    }
}

// const accountDetails = await getAccount(connection, new PublicKey("28hTUftq4zWNsxKAqeUsaPXTVi5k81V67c7WDJvqz3aQ"), 'finalized', TOKEN_2022_PROGRAM_ID);
//   console.log('Associate Token Account is -> ', accountDetails);