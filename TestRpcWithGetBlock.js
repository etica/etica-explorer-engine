const Web3 = require('web3');
var Contract = require('web3-eth-contract');
let mysql = require('mysql');
const { abi } = require('./EticaRelease.json');
const address = '0xC31Bd1AcbfCdf2c659Bb63e5a096d4F761A9B8B5';

const CONTRACTADDRESS = process.env.CONTRACT_ADDRESS;
const MAINRPC = process.env.MAIN_RPC;
const DB_CLIENT_TYPE = process.env.DB_CLIENT_TYPE;


class EventsChecker {
    web3;
    account;
    dbblocksids=[]; // array to retrieve db blocks ids from sql insert
    contract;

    constructor(projectId, account) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(MAINRPC));
        this.account = account.toLowerCase();

        this.contract = new Contract(abi, CONTRACTADDRESS);
        // set provider for all later instances to use
        this.contract.setProvider(MAINRPC);
        console.log('contract loaded');
    }

   async getBlocks(){

    for (let i = 0; i < 50; i++){
    
        let block = await this.web3.eth.getBlock(i);

        console.log('-----> block --->', block);
    }
    
    }

}

let txChecker = new EventsChecker(null, '0x437aDE7282cFc9C5EB4D53e4c17b1e5D3c87eaCc');

txChecker.getBlocks();
