import {
    Contract,
    rpc,
    Networks,
    TransactionBuilder
} from "@stellar/stellar-sdk";

const server = new rpc.Server("https://soroban-testnet.stellar.org");

// Updated to the verified multi-campaign contract ID
const CONTRACT_ID = "CBTOFZ5WLTXLBNOEK4BPCKMSNLGUB6HXLEWQSXVP4Y2LJEKJ2RA2ZO5E";

const contract = new Contract(CONTRACT_ID);

export { server, contract, Networks, TransactionBuilder };