const Web3 = require('web3');
const DbTransactionKnex = require("./DbTransactionKnex.js");

var Contract = require('web3-eth-contract');
const { abi } = require('./EticaRelease.json');

const CONTRACTADDRESS = process.env.CONTRACT_ADDRESS;
const MAINRPC = process.env.MAIN_RPC;


class TransactionChecker {
    web3;
    dbblocksids=[]; // array to retrieve db blocks ids from sql insert
    connection;
    contract;
    CheckTxsFailureIndex; // keeps track id of last etransaction failure status checked
    isRunning;
    DbTransaction;

    constructor(fromIndex) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(MAINRPC));
        this.CheckTxsFailureIndex = fromIndex;
        this.contract = new Contract(abi, CONTRACTADDRESS);
        this.contract.setProvider(MAINRPC);
        this.DbTransaction = new DbTransactionKnex();
        this.isRunning = false;
    }

    async scanTxsFailures() {

        if (this.isRunning) {
            return; // Skip execution if already running
        }


       try { 

        this.DbTransaction.getLastEtransaction().then(async (newlastcheckedid) => {

        this.DbTransaction.checkTxsStatus(this.CheckTxsFailureIndex).then(async (txstocheck) => {
            
            for (let onetxtocheck of txstocheck) {
    
                let txreceipt = await this.web3.eth.getTransactionReceipt(onetxtocheck.hash)
                .then(async (resp) => {        
    
                    if(resp){
                    // If status failure mark it as failure:
                        if(resp.status == false){
                            this.DbTransaction.updateTxFailure(onetxtocheck);
                        }
                            this.CheckTxsFailureIndex = onetxtocheck.id;
                       //     console.log('in loop this.CheckTxsFailureIndex is ', this.CheckTxsFailureIndex);
                    }
                    // try second chance:
                    else {
                        // second chance:
                        let txreceipt2 = await this.web3.eth.getTransactionReceipt(onetxtocheck.hash)
                        .then(async (resp2) => {        
    
                            if(resp2){
                            // If status failure mark it as failure:
                                if(resp2.status == false){
                                    this.DbTransaction.updateTxFailure(onetxtocheck);
                                }
                               
                            this.CheckTxsFailureIndex = onetxtocheck.id;
                         //   console.log('in loop this.CheckTxsFailureIndex is ', this.CheckTxsFailureIndex);          
                        }
                        })
                    }
    
                    });
                        
            }  
            
        }).catch(e => console.log(e));
    
       }).catch(e => console.log(e));

        } finally {
            this.isRunning = false;
        }

    }

}

let txChecker = new TransactionChecker(1);

setInterval(() => {
    txChecker.scanTxsFailures(txChecker.CheckTxsFailureIndex);
}, 10 * 1000);