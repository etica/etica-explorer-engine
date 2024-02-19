const Web3 = require('web3');
const DbTransactionKnex = require("./DbTransactionKnex.js");

var Contract = require('web3-eth-contract');
const { abi } = require('./EticaRelease.json');

const CONTRACTADDRESS = process.env.CONTRACT_ADDRESS;
const MAINRPC = process.env.MAIN_RPC;

class TransactionChecker {
    web3;
    connection;
    contract;
    isRunning;
    DbTransaction;

    constructor() {
        this.web3 = new Web3(new Web3.providers.HttpProvider(MAINRPC));
        this.contract = new Contract(abi, CONTRACTADDRESS);
        this.contract.setProvider(MAINRPC);
        this.DbTransaction = new DbTransactionKnex();
        this.isRunning = false;
    }


    async checkmissingtxs() {

        if (this.isRunning) {
            // console.log('checkmissingtxs() already running. Skipping this round.');
            return; // Skip execution if already running
        }
        this.isRunning = true;
        try {
            const missingtxs = await this.DbTransaction.getmissingtxs();
            for (let onemissingtx of missingtxs) {
                let txHash = onemissingtx.hash;
                let etransaction = await this.getweb3tx(txHash);
                let dbblockid = await this.DbTransaction.getdbidBlock(etransaction.blockNumber);
                let insertedid = await this.DbTransaction.insertEtransaction(etransaction, dbblockid);
                if (insertedid > 0) {
                    await this.DbTransaction.deletestaging(etransaction.hash);
                }
            }

            this.isRunning = false;

        } catch (error) {
            console.error(error);
        }

    }

    async getweb3tx(txHash){
        return await this.web3.eth.getTransaction(txHash);
    }


}

let txChecker = new TransactionChecker();

console.log('SynchronizeMissedTxs launched with success.');

setInterval(() => {
    txChecker.checkmissingtxs();
}, 15 * 1000);