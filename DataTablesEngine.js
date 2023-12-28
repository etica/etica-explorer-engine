const Web3 = require('web3');
let mysql = require('mysql');

const DbTransactionKnex = require("./DbTransactionKnex.js");

var Contract = require('web3-eth-contract');
const { abi } = require('./EticaRelease.json');
const CONTRACTADDRESS = process.env.CONTRACT_ADDRESS;
const MAINRPC = process.env.MAIN_RPC;
const RANDOM_ADDRESS = '0x8d5D6530aD5007590a319cF2ec3ee5bf8A3C35AC';

class CronsHandler {

    connection;
    contract;
    web3;
    DbTransaction;

    constructor() {
      this.web3 = new Web3(new Web3.providers.HttpProvider(MAINRPC));
        this.contract = new Contract(abi, CONTRACTADDRESS);
        this.contract.setProvider(MAINRPC);
        this.DbTransaction = new DbTransactionKnex();
        console.log('DataTablesEngines started with success');
    }


// --------- MAIN FUNCTIONS ---------- //

// Main function, fill diseases if disease's diseasehash field in db still null:
async fill_diseasesnohash(){

  this.DbTransaction.diseasesnohash().then(async (diseases) => {

    for (let onedisease of diseases) {
    console.log('onedisease no hash found is', onedisease);
    this.getdisease(onedisease).then((fulldisease) => {
         
        if (fulldisease && fulldisease != null){
          console.log('full disease no hash is ', fulldisease);
          this.DbTransaction.updatedisease(fulldisease, onedisease.diseaseindex);
        }
        else{
         console.log('cannot fill diseasehash, disease not found', onedisease);
        }  
      
      });
    }

  });

}


// Main function, fill chunks if chunk's idx field in db still null:
async fill_chunksnohash(){

  this.DbTransaction.chunksnohash().then(async (chunks) => {

    for (let onechunk of chunks) {
    console.log('onechunk no hash found', onechunk);
    this.getchunk(onechunk).then((fullchunk) => {
  
        if (fullchunk && fullchunk != null){
          console.log('full chunk no hash is: ', fullchunk);
          this.DbTransaction.updatechunk(fullchunk, onechunk.chunkid);
        }
        else{
         console.log('no chunk found');
        }  
      
      
      });
    }
  });

}


// Main function, fill proposal if proposal's periodid field in db still null:
async fill_proposalsnoperiod(){

  this.DbTransaction.proposalsnoperiod().then(async (proposals) => {

    for (let oneproposal of proposals) {
    console.log('oneproposal no period found is', oneproposal);
    this.getproposal(oneproposal).then((resp) => {
        let fullproposal = resp.fullproposal;
        let fullpropsdata = resp.fullpropsdata;
      
        if (fullproposal && fullproposal != null){
            console.log('full proposal no period is ', fullproposal);
            this.DbTransaction.updateproposal(fullproposal, oneproposal.proposed_release_hash).then(async (results) => {
            this.DbTransaction.insertpropsdata(fullpropsdata, oneproposal.proposed_release_hash, oneproposal.id);   
          });
        }
        else{
         console.log('no proposal found');
        }  
      
      
      });
    }
  });

}

// Main function, fill periods if period's reward_for_curation field in db still null:
async fill_periodsnorewards(){

  this.DbTransaction.periodsnorewards().then(async (periods) => {

    for (let oneperiod of periods) {
    
    this.getperiod(oneperiod).then((fullperiod) => {
        
        if (fullperiod && fullperiod != null){
          this.DbTransaction.updateperiod(fullperiod, oneperiod.periodid);
        }
        else{
         console.log('no period found');
        }  
      
      
      });
    }
  });

}

// --------- MAIN FUNCTIONS ---------- //

// DISEASES  
async getdisease(disease){
  let _diseaseindex = disease.diseaseindex
  let fulldisease = await this.contract.methods.diseases(_diseaseindex).call({from: RANDOM_ADDRESS});
  return fulldisease;
}
 // DISEASES

// CHUNKS
async getchunk(chunk){
let _chunkid= chunk.chunkid
let fullchunk = await this.contract.methods.chunks(_chunkid).call({from: RANDOM_ADDRESS});
return fullchunk;
}
// CHUNKS

// PROPOSALS 
async getproposal(proposal){
let _proposed_release_hash= proposal.proposed_release_hash;
let resp = {};
resp.fullproposal = await this.contract.methods.proposals(_proposed_release_hash).call({from: RANDOM_ADDRESS});
resp.fullpropsdata = await this.contract.methods.propsdatas(_proposed_release_hash).call({from: RANDOM_ADDRESS});
return resp;
}
// PROPOSALS


// PERIODS
async getperiod(period){
let _periodid = period.periodid
let fullperiod = await this.contract.methods.periods(_periodid).call({from: RANDOM_ADDRESS});
return fullperiod;
}
// PERIODS


}

let newHanlder = new CronsHandler();

setInterval(() => {
    newHanlder.fill_diseasesnohash();
}, 60 * 1000); // every 60 seconds 

setInterval(() => {
  newHanlder.fill_chunksnohash();
}, 15 * 1000); // every 15 seconds


setInterval(() => {
  newHanlder.fill_proposalsnoperiod();
}, 15 * 1000); // every 15 seconds 

setInterval(() => {
  newHanlder.fill_periodsnorewards();
}, 60 * 1000); // every 60 seconds