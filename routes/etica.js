// Import dependencies
const express = require("express");

const Web3 = require('web3');
let mysql = require('mysql');

var Contract = require('web3-eth-contract');
const { abi } = require('../EticaRelease.json');

const CONTRACTADDRESS = process.env.CONTRACT_ADDRESS;
const MAINRPC = process.env.MAIN_RPC;
const DB_CLIENT_TYPE = process.env.DB_CLIENT_TYPE;
let web3 = new Web3(new Web3.providers.HttpProvider(MAINRPC));
let contract = new Contract(abi, CONTRACTADDRESS);
// set provider for all later instances to use
contract.setProvider(MAINRPC);
const RANDOM_ADDRESS = '0x8d5D6530aD5007590a319cF2ec3ee5bf8A3C35AC';


// Setup the router for express
const router = express.Router();

// *************************
// Set up the route handlers
// *************************

router.get("/supply", [], async (req, res) => {

     _supply = await contract.methods.totalSupply().call({from: RANDOM_ADDRESS});

     res.send({
        ok: true,
        supply: _supply
    });

});

router.get("/supply/unit/eti", [], async (req, res) => {

    _supply = await contract.methods.totalSupply().call({from: RANDOM_ADDRESS});

    _supply = web3.utils.fromWei(_supply, 'ether');

    res.send({
       ok: true,
       supply: _supply
   });

});

router.get("/threshold", [], async (req, res) => {

     _threshold = await contract.methods.APPROVAL_THRESHOLD().call({from: RANDOM_ADDRESS});

     res.send({
        ok: true,
        threshold: _threshold
    });

});

router.get("/tokensminted", [], async (req, res) => {

    _tokensMinted = await contract.methods.tokensMinted().call({from: RANDOM_ADDRESS});

    res.send({
       ok: true,
       tokensMinted: _tokensMinted
   });

});

router.get("/blockreward", [], async (req, res) => {

    _blockreward = await contract.methods.blockreward().call({from: RANDOM_ADDRESS});

    res.send({
       ok: true,
       blockreward: _blockreward
   });

});

router.get("/periodrewardtemp", [], async (req, res) => {

    _periodrewardtemp = await contract.methods.periodrewardtemp().call({from: RANDOM_ADDRESS});

    res.send({
       ok: true,
       periodrewardtemp: _periodrewardtemp
   });

});

router.get("/challengenumber", [], async (req, res) => {

    _challengeNumber = await contract.methods.challengeNumber().call({from: RANDOM_ADDRESS});

    res.send({
       ok: true,
       challengeNumber: _challengeNumber
   });

});


router.get("/epochcount", [], async (req, res) => {

    _epochCount = await contract.methods.epochCount().call({from: RANDOM_ADDRESS});

    res.send({
       ok: true,
       epochCount: _epochCount
   });

});

router.get("/miningtarget", [], async (req, res) => {

    _miningTarget = await contract.methods.miningTarget().call({from: RANDOM_ADDRESS});

    res.send({
       ok: true,
       miningTarget: _miningTarget
   });

});

router.get("/miningdifficulty", [], async (req, res) => {

    _MiningDifficulty = await contract.methods.getMiningDifficulty().call({from: RANDOM_ADDRESS});

    res.send({
       ok: true,
       MiningDifficulty: _MiningDifficulty
   });

});

router.get("/miningreward", [], async (req, res) => {

    _MiningReward = await contract.methods.getMiningReward().call({from: RANDOM_ADDRESS});

    res.send({
       ok: true,
       MiningReward: _MiningReward
   });

});

router.get("/maximumtarget", [], async (req, res) => {

    _MaximumTarget = await contract.methods._MAXIMUM_TARGET().call({from: RANDOM_ADDRESS});

    res.send({
       ok: true,
       MaximumTarget: _MaximumTarget
   });

});

router.get("/minimumtarget", [], async (req, res) => {

    _MinimumTarget = await contract.methods._MINIMUM_TARGET().call({from: RANDOM_ADDRESS});

    res.send({
       ok: true,
       MinimumTarget: _MinimumTarget
   });

});


router.get("/latestdifficultyperiodstarted", [], async (req, res) => {

    _latestDifficultyPeriodStarted = await contract.methods.latestDifficultyPeriodStarted().call({from: RANDOM_ADDRESS});

    res.send({
       ok: true,
       latestDifficultyPeriodStarted: _latestDifficultyPeriodStarted
   });

});

router.get("/lastrewardto", [], async (req, res) => {

    _lastRewardTo = await contract.methods.lastRewardTo().call({from: RANDOM_ADDRESS});

    res.send({
       ok: true,
       lastRewardTo: _lastRewardTo
   });

});

router.get("/lastrewardethblocknumber", [], async (req, res) => {

    _lastRewardEthBlockNumber = await contract.methods.lastRewardEthBlockNumber().call({from: RANDOM_ADDRESS});

    res.send({
       ok: true,
       lastRewardEthBlockNumber: _lastRewardEthBlockNumber
   });

});

router.get("/balance", [], async (req, res) => {

    let _address= req.query.address;
     let _balance = {};
     _balance.eticas = await contract.methods.balanceOf(_address).call({from: RANDOM_ADDRESS});
     _balance.bosoms = await contract.methods.bosomsOf(_address).call({from: RANDOM_ADDRESS});
     _balance.egaz = await web3.eth.getBalance(_address);

     res.send({
        ok: true,
        balance: _balance
    });

});

// Export the router
module.exports = router;