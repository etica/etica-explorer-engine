const Web3 = require('web3');
const DbTransactionKnex = require("./DbTransactionKnex.js");

var Contract = require('web3-eth-contract');
const { abi } = require('./EticaRelease.json');
const CONTRACTADDRESS = process.env.CONTRACT_ADDRESS;
const MAINRPC = process.env.MAIN_RPC;

class CronsHandler {

    lasttransfersiddone;
    isRunningUpdateTransfersTimestamps;
    isRunningUpdateStagings;
    DbTransaction;

    constructor(_lasttransfersiddone) {
        
      this.web3 = new Web3(new Web3.providers.HttpProvider(MAINRPC));
      this.contract = new Contract(abi, CONTRACTADDRESS);
      this.contract.setProvider(MAINRPC);
      this.DbTransaction = new DbTransactionKnex();

      this.lasttransfersiddone = _lasttransfersiddone;
      this.isRunningUpdateTransfersTimestamps = false;
      this.isRunningUpdateStagings = false;
      console.log('ExplorersqlCronds loaded');

    }

// --------- MAIN FUNCTIONS ---------- //


// Main function, intial call to update txs eventtypes thanks to stagings. Deletes stagings once tx updated or Updates stagings as missingtx if tx not found
async updatestagings(){

  if (this.isRunningUpdateStagings) {
    //console.log('this.isRunningUpdateStagings false, dont proceed');
    return; // Skip execution if already running
  }
  this.isRunningUpdateStagings = true;
  //console.log('this.isRunningUpdateStagings now true lets proceed');
  try {
    const stagingupdates = await this.DbTransaction.getstagings();
    for (let onestaging of stagingupdates) {
        let tx = await this.DbTransaction.getstagingtx(onestaging, 1);
        if (tx && tx != null){
          await this.DbTransaction.updatetxtype(tx, onestaging);
          await this.DbTransaction.deletestaging(onestaging.hash);
        }
        else{
          await this.DbTransaction.setstagingmissingtx(onestaging);
        }
    }
  } catch (error) {
    console.error(error);
  } finally {
    this.isRunningUpdateStagings = false;
   // console.log('this.isRunningUpdateStagings is now false, ready for next batch');
  }

}



// Main function, intial call to update txs eventtypes thanks to stagings. Deletes stagings once tx updated or Updates stagings as missingtx if tx not found
async optimised_update_transfers_timestamp(){

                if (this.isRunningUpdateTransfersTimestamps) {
                   // console.log('this.isRunningUpdateTransfersTimestamps false, dont proceed');
                    return; // Skip execution if already running
                }
                this.isRunningUpdateTransfersTimestamps = true;
                // console.log('this.isRunningUpdateTransfersTimestamps now true lets proceed');
                try {
                    const transfers = await this.DbTransaction.transfersnotimestamp(this.lasttransfersiddone);
                    for (let onetransfer of transfers) {
                        let transfertx = await this.DbTransaction.gettransfertx(onetransfer, 1);
                        if (transfertx && transfertx != null){
                        let block = await this.DbTransaction.getblockfromtx(transfertx, 1);
                        let isinserted = await this.DbTransaction.updatettransfertimestamp(onetransfer, block.timestamp);
                        
                        if(isinserted && this.lasttransfersiddone < onetransfer.id){
                          this.lasttransfersiddone = onetransfer.id;
                         }

                        }
                        else {

                          let staging = await this.DbTransaction.getstagingtransfer(onetransfer);
                          if (!staging || staging == null){

                            let newstaging = {
                              hash: onetransfer.transactionhash,
                              txmissing: 1,
                              eventtype: null // eventtype is null for transfers
                            };

                            let isinserted = await this.DbTransaction.insertstaging(newstaging);
                            
                            if(isinserted && this.lasttransfersiddone < onetransfer.id){
                              // console.log('this.lasttransfersiddone is now', this.lasttransfersiddone);
                              this.lasttransfersiddone = onetransfer.id;
                             }
                          }

                        }

                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    this.isRunningUpdateTransfersTimestamps = false;
                   // console.log('this.isRunningUpdateTransfersTimestamps is now false, ready for next batch');
                }
}

// --------- MAIN FUNCTIONS ---------- //


}

let newHanlder = new CronsHandler(1);

setInterval(() => {
    newHanlder.updatestagings();
}, 10 * 1000); // every 20 seconds 

setInterval(() => {
  newHanlder.optimised_update_transfers_timestamp();
}, 10 * 1000); // every 20 seconds