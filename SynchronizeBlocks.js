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
    DbTransaction;
    blocksdelay;

    constructor() {
        this.web3 = new Web3(new Web3.providers.HttpProvider(MAINRPC));
        this.contract = new Contract(abi, CONTRACTADDRESS);
        this.contract.setProvider(MAINRPC);
        this.DbTransaction = new DbTransactionKnex();
        this.isSyncing = false;
    }

    async synchronizeBlocks() {

            // Prevent concurrent synchronization by setting a flag
            if (this.isSyncing) {
                console.log('Already syncing blocks. Skipping this round.');
                return;
            }
            try {

                this.isSyncing = true;

                let block_latestonchain = await this.web3.eth.getBlock('latest'); // last block mined and confirmed on chain
                
                this.DbTransaction.getlatestdb().then(async (block_latestdb) => {

                console.log('latest block found is: ', block_latestdb);

                this.blocksdelay = block_latestonchain.number - block_latestdb.number; // Get nb blocks delay of db compared to onchain

                console.log('block delay is ', this.blocksdelay);
                // If there is a delay we synchronize the db:
                if(this.blocksdelay > 0){
                for (let i = 0; i < this.blocksdelay; i++){
                    //console.log('sincronizing a block!');
                    let j = block_latestdb.number + 1 + i; // implements j counter because (block_latestdb.number - i) was inserting in inverse order. example 10479 thne 10478 ...
                    let nextblock = await this.web3.eth.getBlock(j);
                    await this.processBlock(nextblock, block_latestdb).then((resp) => {      
                        this.checkEvents(nextblock.number, nextblock.number);
                    });
                }
                }

                });

            } finally {
                this.isSyncing = false;
            }





    }

    async processBlock(block,  _block_latestdb) {

        let number = block.number;

        // Check Block is already in DB:
        this.DbTransaction.checkBlockindb(block, _block_latestdb).then(async (isindb) => {

            // if block not already in DB we proceed:
             if(!isindb){
                    var dbblockid;
                    try {
                        dbblockid = await this.DbTransaction.updatedbBlock(block);
                    } catch (error) {
                        // Error occured in db transaction, the DbTransactionMYSQL.js, DbTransactionPGSQL.js should have called .reconnectDatabase() to reset db connection:
                        console.log('error', error);
                    }

                    if (block != null && block.transactions != null) {
                    
                        for (let txHash of block.transactions) {

                                this.getweb3tx(txHash).then((resp2) => {
                                    let etransaction = resp2;
                                    // Insert tx in db:
                                    this.DbTransaction.insertEtransaction(etransaction, dbblockid);
                                });

                        }
                    }
            } 
            else {
                console.log('Block not processed because already in DB');
                console.log('Block number was', block.number);
                return;
            }

            }).catch(e => console.log(e));

    }


    async getweb3tx(txHash){
        return await this.web3.eth.getTransaction(txHash);
    }   

    //   ------------ EVENTS  -------------------- //

    // Transfes, Mints, NewCommits, NewDiseases ...

    async checkEvents(_fromblock, _toblock){

        let options = {
            fromBlock: _fromblock,                  //Number || "earliest" || "pending" || "latest"
            toBlock: _toblock
        };
        
        return await this.contract.getPastEvents('allEvents', options)
        .then(async (events) => {
    
        events.forEach(onevent => {
            
            if(onevent.event == 'Transfer'){
               this.DbTransaction.insertTransfer(onevent);
            }
            else if(onevent.event == 'Mint'){
                this.DbTransaction.insertMint(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 2); // eventtype 2
            }
            else if(onevent.event == 'NewProposal'){
                this.DbTransaction.insertNewProposal(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 3); // eventtype 3
            }
            else if(onevent.event == 'NewChunk'){
                this.DbTransaction.insertNewChunk(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 4); // eventtype 4
            }
            else if(onevent.event == 'RewardClaimed'){
                this.DbTransaction.insertRewardClaim(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 5); // eventtype 5
            }
            else if(onevent.event == 'NewFee'){
                this.DbTransaction.insertNewFee(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 6); // eventtype 6
            }
            else if(onevent.event == 'NewSlash'){
                this.DbTransaction.insertNewSlash(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 7); // eventtype 7
            }
            else if(onevent.event == 'NewCommit'){
                this.DbTransaction.insertNewCommit(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 8); // eventtype 8
            }
            else if(onevent.event == 'NewReveal'){
                this.DbTransaction.insertNewReveal(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 9); // eventtype 9
            }
            else if(onevent.event == 'NewStake'){
                this.DbTransaction.insertNewStake(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 10); // eventtype 10
            }
            else if(onevent.event == 'StakeClaimed'){
                this.DbTransaction.insertStakeClaim(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 11); // eventtype 11
            }
            else if(onevent.event == 'NewDisease'){
                this.DbTransaction.insertNewDisease(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 12); // eventtype 12
            }
            else if(onevent.event == 'NewStakescsldt'){
                this.DbTransaction.insertNewStakesclsdt(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 13); // eventtype 13
            }
            else if(onevent.event == 'NewStakesnap'){
                this.DbTransaction.insertNewStakesnap(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 14); // eventtype 14
            }
            else if(onevent.event == 'TieClaimed'){
                this.DbTransaction.insertTieClaimed(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 15); // eventtype 15
            }
            else if(onevent.event == 'NewRecover'){
                this.DbTransaction.insertNewRecover(onevent);
                this.DbTransaction.updateEtransaction(onevent.transactionHash, 17); // eventtype 17
            }
            else if(onevent.event == 'CreatedPeriod'){
                this.DbTransaction.insertNewPeriod(onevent);
            }
            else {
                console.log('ERROR INSERT EVENT TYPE UNKNOWN start');
                console.log(onevent);
                console.log('ERROR INSERT EVENT TYPE UNKNOWN end');
            }
    
        });
    
        })
        .catch(err => console.log('error!', err));
        
       }
    
       async getweb3tx(txHash){
        return await this.web3.eth.getTransaction(txHash);
       }


    // -------------  EVENTS  -------------------  //


    async insertFirstBlock() {
        
        const existanyblockindb = await this.DbTransaction.existanyblockindb();

        if(!existanyblockindb){
            let firstblock = await this.web3.eth.getBlock(1); // last block mined and confirmed on chain
            console.log('Inserting first block : ', firstblock);
            await this.DbTransaction.updatedbBlock(firstblock);
        }
        
    }


}

let txChecker = new TransactionChecker();

console.log('SynchronizeBlocksKnex launched with success.');
console.log('Script operational and will keep syncing the Database with Blockchain data.');

txChecker.insertFirstBlock();
setInterval(() => {
    txChecker.synchronizeBlocks();
}, 15 * 1000);