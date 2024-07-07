
import {
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
  import {
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    getMintLen,
    createInitializeMetadataPointerInstruction,
    getMint,
    getTokenMetadata,
    TYPE_SIZE,
    LENGTH_SIZE,
    mintTo,
    createInitializeNonTransferableMintInstruction,
    getOrCreateAssociatedTokenAccount,
    transferChecked
  } from "@solana/spl-token";
  import {
    createInitializeInstruction,
    createUpdateFieldInstruction,
    pack,
  } from "@solana/spl-token-metadata";
  import { keypair, payer } from "./keypair.js";
  import { connection } from "./connection.js";
  
  
  //Basic info needed for creation
  const tokenName = 'Christex Bounty Award';
  const tokenSymbol = 'CBA';
  const tokenExternalUrl = 'https://earn.christex.foundation/';
  
  
  // setting up the mint address
  const mint = Keypair.generate();
  const decimals = 0;
  const supply = 1;
  
  // Creating the metadata object
  const metadata = {
    mint: mint.publicKey,
    name: tokenName,
    symbol: tokenSymbol,
    uri: tokenExternalUrl,
    additionalMetadata: [['Skills Needs', 'Engineering']],
  };
  
  //calculating the space needed for the metadata
  const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
  const metadataLen = pack(metadata).length;
  const mintAndExtension = getMintLen([ExtensionType.MetadataPointer, ExtensionType.NonTransferable])
  
  //rent required for mint account 
  const lamports = await connection.getMinimumBalanceForRentExemption(mintAndExtension + metadataLen + metadataExtension);
  
  
  //Building the instructions below 
  
  const createAccount = SystemProgram.createAccount({
    // call System Program to create new account
    fromPubkey: payer,
    newAccountPubkey: mint.publicKey,
    space: mintAndExtension,
    programId: TOKEN_2022_PROGRAM_ID,
    lamports
  });
  
  const initializeNonTransferableMint = createInitializeNonTransferableMintInstruction(
    //initializing the NonTransferableMintInstruction Extension
    mint.publicKey,
    TOKEN_2022_PROGRAM_ID
  )

  const initializeMetadataPointer =
    createInitializeMetadataPointerInstruction(
      //initializing the MetadataPointer Extension
      mint.publicKey,
      payer,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID,
    );
  
  
  const initializeMint = createInitializeMintInstruction(
    //initializing the mint Account
    mint.publicKey,
    decimals,
    payer,
    payer,
    TOKEN_2022_PROGRAM_ID,
  );
  
  
  const initializeMetadata = createInitializeInstruction({
    //initializing the metadata
    programId: TOKEN_2022_PROGRAM_ID,
    metadata: mint.publicKey,
    updateAuthority: payer,
    mint: mint.publicKey,
    mintAuthority: payer,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
  });
  
  
  const updateField = createUpdateFieldInstruction({
    //add custom metadata to the mint  
    programId: TOKEN_2022_PROGRAM_ID,
    metadata: mint.publicKey,
    updateAuthority: payer,
    field: metadata.additionalMetadata[0][0],
    value: metadata.additionalMetadata[0][1],
  });
  
  
  
  // Add instructions to new transaction
  const transaction = new Transaction().add(
    createAccount,
    initializeNonTransferableMint,
    initializeMetadataPointer,
    initializeMint,
    initializeMetadata,
    updateField
  );
  
  
  // Send transaction
  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [keypair, mint], // Signers
  );
  
  // logging the mint account and metadata stored in the mint Account
  
  // Fetching the mint
  const mintDetails = await getMint(connection, mint.publicKey, undefined, TOKEN_2022_PROGRAM_ID);
  console.log('Mint is ->', mintDetails);
  
  // Since the mint stores the metadata in itself, we can just get it like this
  const Metadata = await getTokenMetadata(connection, mint.publicKey);
  console.log('Metadata is ->', Metadata);
  
  console.log(
    "\nTransaction Sig :",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
  );


  // creating a source keypair and account
console.log("=========================================")
console.log("Creating Source Keypair and account");
  const sourceKeypair = Keypair.generate();
  let sourceATA = await getOrCreateAssociatedTokenAccount(connection,keypair,mint.publicKey,sourceKeypair.publicKey, false,undefined, undefined, TOKEN_2022_PROGRAM_ID);

  // source account before minting
  console.log("\nSource amount before Minting :", sourceATA.amount);

  // minting some token to the source account 
console.log("\n=========================================")
console.log("Minting token to source Keypair");
await mintTo(connection, keypair, mint.publicKey,sourceATA.address,payer,supply,[keypair],undefined,TOKEN_2022_PROGRAM_ID)
sourceATA = await getOrCreateAssociatedTokenAccount(connection,keypair,mint.publicKey,sourceKeypair.publicKey, false,undefined, undefined, TOKEN_2022_PROGRAM_ID);
console.log("\nSource amount after Minting :", sourceATA.amount); //logging amount after minting

console.log("\n=========================================")
console.log("Creating Destination Keypair");
  // creating a destination keypair and account
  const destinationKeypair = Keypair.generate();
  const destinationATA = await getOrCreateAssociatedTokenAccount(connection,keypair,mint.publicKey,destinationKeypair.publicKey, false,undefined, undefined, TOKEN_2022_PROGRAM_ID);

  console.log("\n=========================================")
console.log("Attempting to transfer non-transferable that has a metadata Pointer and metadata from source to destintion");
try {
  await transferChecked(
    connection, keypair, sourceATA.address, mint.publicKey, destinationATA.address,sourceKeypair,BigInt( 1*decimals),decimals,[sourceKeypair],undefined,TOKEN_2022_PROGRAM_ID                                             
  );

} catch (e) {
  console.log(
    'This transfer is failing because the mint is non-transferable \n',
  )
}
