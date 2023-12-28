const DbHandler = require("./DbHanlder.js");
let mysql = require('mysql');


class DbTransactionMYSQL {

    connection;

    constructor() {
        this.initDatabaseConnection();
    }

    async initDatabaseConnection() {

        // Logic for PostgreSQL connection
        this.connection = await mysql.connect({
            host: this.options.MYSQL_HOST,
            user: this.options.MYSQL_USER,
            password: this.options.MYSQL_PASSWORD,
            database: this.options.MYSQL_DATABASE,
            port: this.options.MYSQL_PORT,
        });

        // Handle reconnection in case of a fatal error
        this.connection.on('error', (err) => {
            if (err.fatal) {
                console.error('Fatal db error detected!');
                console.error('Fatal database error:', err);
                this.reconnectDatabase();
            }
        });

    }

    reconnectDatabase() {
        console.log("\n New connection attempt...");

        // Close the current connection
        if (this.connection) {
            this.connection.end();
        }
        // Recreate a new connection
        this.initDatabaseConnection();
    }


    async updatedbBlock(block) {
        let sqlblock = {
            number: block.number,
            hash: block.hash,
            parenthash: block.parentHash,
            nonce: block.nonce,
            sha3Uncles: block.sha3Uncles,
            logsBloom: block.logsBloom,
            transactionsRoot: block.transactionsRoot,
            stateRoot: block.stateRoot,
            miner: block.miner,
            difficulty: block.difficulty,
            totalDifficulty: block.totalDifficulty,
            extraData: block.extraData,
            size: block.size,
            gasLimit: block.gasLimit,
            gasUsed: block.gasUsed,
            timestamp: block.timestamp,
            created_at: new Date(),
            updated_at: new Date()
        };
    
        let _connection = this.connection;
        return new Promise(async (resolve, reject) => {
            await _connection.query('INSERT INTO blocks SET ?', sqlblock, (error, results) => {
                if(error != null) 
                {
                    this.reconnectDatabase();
                    reject(error);
                }
    
                if(results.insertId > 0){
                    resolve(results.insertId);  
                }
                else {
                    reject(error);
                }
            });
        });
    }

    // Will insert block in db:
    async insertEtransaction(tx, dbblockid) {
    
        let sqltransaction = {
            block_id: dbblockid,
            blockNumber: tx.blockNumber,
            blockHash : tx.blockHash,
            hash: tx.hash,
            nonce: tx.nonce,
            transactionIndex: tx.transactionIndex,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            gas: tx.gas,
            gasPrice: tx.gasPrice,
            input: tx.input,
            created_at: new Date(),
            updated_at: new Date()
        };
    
        // If no input in tx then it is an egaz (eventtype 1):
        if(tx.input == '0x'){
           sqltransaction.eventtype = 1;
        }
        
        let _connection = this.connection;
        return new Promise(async (resolve, reject) => {
        // Insert the database
        _connection.query('INSERT INTO etransactions SET ?', sqltransaction, (error, results) => {
            if(error){
                this.reconnectDatabase();
                reject(error);
            }        
            resolve(results);
            });
        });
    
    }

    // Will insert stagingupdates with info for update of this tx by blockchain-explorer cron (txhash is etransaction hash)
    async updateEtransaction(txhash, _eventtype) {

    let sqleventtype = {
            eventtype: _eventtype,
            hash: txhash
    };
    
    let _connection = this.connection;
    return new Promise(async (resolve, reject) => {
    _connection.query('INSERT INTO stagingupdates SET ?', sqleventtype, (error, results) => {
        //if(error) reject(error);
        if(error){
            this.reconnectDatabase();
            reject(error);
        }        
        resolve(results);
        });
    });
    
    }


    async getLastEtransaction() {

        var query_str =
            "SELECT * " +
            "FROM etransactions " +   
            " ORDER BY id DESC LIMIT 1";
    
        var query_var = [];    
    
        let _connection = this.connection;
       
        return new Promise(async function(resolve, reject){
        // query the database
    var cnt = await _connection.query(query_str, query_var, (error, result) => {
            if(error) {
                this.reconnectDatabase();
                reject(error);
            } 
            
            
            if (typeof result !== 'undefined'){
            if(result.length){
                console.log('result.length', result.length);
                if(result.length > 0){
                    console.log('result.length is > 0');
                }

                else{
                    console.log('ERROR result.length is not > 0');
                }

                resolve(result[0].id); // returns last etransactions row id
            }
    
            else {
                let noresult =[];
                resolve(noresult);
            }
        }
    else {
        let noresult =[];
        resolve(noresult);
    }
            
        });
    
    });
    
        }

    async checkTxsStatus(CheckTxsFailureIndex) {

        var query_str =
            "SELECT * " +
            "FROM etransactions " +   
            "WHERE (id > ? AND value = 0 AND eventtype IS NULL AND eticatransf IS NULL)";
    
        var query_var = [CheckTxsFailureIndex];    
    
        let _connection = this.connection;
        
        return new Promise(async function(resolve, reject){
        // query the database
            var cnt = await _connection.query(query_str, query_var, (error, results) => {
                    if(error) {
                        this.reconnectDatabase();   
                        reject(error);
                    }
                    
                    
                    if (typeof results !== 'undefined'){
                    if(results.length){

                        // block is in DB
                        resolve(results);
                    }
            
                    else {
                        let noresults =[];
                        resolve(noresults);
                    }
                }
            else {
                let noresults =[];
                resolve(noresults);
            }
                    
                });
            
            });
        
        }


    async updateTxFailure(_tx) {

        let txhash = _tx.hash;
        let sqlupdatetx = [{'status': 0}, txhash];
        
        let _connection = this.connection;
        return new Promise(async function(resolve, reject){
        // Update the database:
        _connection.query('UPDATE etransactions SET ? WHERE hash = ?', sqlupdatetx, (error, results) => {
            if(error) {
              this.reconnectDatabase();
              reject(error);
            }
            
            resolve(results);
            });
        });
    
    }


    async checkBlockindb(block, _block_latestdb) {

        var query_str =
            "SELECT * " +
            "FROM blocks " +
            "WHERE id > ? " +   
            "AND (number = ?) " +
            "LIMIT 1 ";
        
            let max_serachid = _block_latestdb.id - 1000; // search only on last 1000 blocks    
            var query_var = [max_serachid,block.number];
            

        let _connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
        // query the database
    var cnt = await _connection.query(query_str, query_var, (error, results) => {
        if(error){
            this.reconnectDatabase();
            reject(error);
        }
            
            if (typeof results !== 'undefined'){
            if(results.length){
                
                // block is in DB
                resolve(true);
            }

            else {
                // block is not in DB yet
                resolve(false);
            }
        }
    else {
        reject('error query did not return results');
    }
            
        });

    });

}


async getlatestdb() {

    var query_str =
        "SELECT * " +
        "FROM blocks " +   
        "ORDER BY ID DESC " +
        "LIMIT 1 ";


    let _connection = this.connection;
   
    return new Promise(async (resolve, reject) => {
    // query the database
    await _connection.query(query_str, (error, results) => {
        if(error){
            this.reconnectDatabase();
            reject(error);
        }
        

        if (typeof results !== 'undefined'){
        if(results.length){
            
            if(results[0].number > 0){
               // results[0] should contain block from DB
               resolve(results[0]);

            }
            else {
                // block is not in DB yet
                reject('error block from db results format not expected');
            }
            
            
        }

        else {
            // block is not in DB yet
            reject('error retrieving block');
        }
    }
else {
    reject('error query did not return results');
}


        
    });

});
    
    }



    async getmissingtxs() {

        var query_str =
            "SELECT * " +
            "FROM stagingupdates " +   
            "WHERE txmissing = 1 "
    
    
        let _connection = this.connection;
       
        return new Promise(async function(resolve, reject){
        // query the database
        await _connection.query(query_str, (error, results) => {
            if(error){
                this.reconnectDatabase();
                reject(error);
            }
            
            if (typeof results !== 'undefined'){
            if(results.length){
    
                
                   resolve(results);
                
                
            }
    
            else {
                // no missingtxs found:
                let nomissingtxs = [];
                resolve(nomissingtxs);
            }
        }
    else {
        reject('error query did not return results');
    }
    
    
            
        });
    
    });
        
        }

        async getdbidBlock(blocknumber) {

            var query_str =
                "SELECT * " +
                "FROM blocks " +   
                "WHERE number = ? " +
                "LIMIT 1 ";
            let sqlblock = [blocknumber];
        
            let _connection = this.connection;
           
            return new Promise(async function(resolve, reject){
            // query the database
            await _connection.query(query_str, sqlblock, (error, results) => {
                if(error){
                    this.reconnectDatabase();
                    reject(error);
                }
                
                if (typeof results !== 'undefined'){
                if(results.length){
                    
                    if(results[0].id > 0){
                       // results[0] should contain block from DB
                       resolve(results[0].id);
    
                    }
                    else {
                        // block is not in DB yet
                        reject('error block from db results format not expected');
                    }
                    
                    
                }
        
                else {
                    // block is not in DB yet
                    reject('error retrieving block');
                }
            }
        else {
            reject('error query did not return results');
        }
        
        
                
            });
        
        });
            
            }

    async deletestaging(_hash) {

        var query_str =
            "DELETE " +
            "FROM stagingupdates " +
            "WHERE hash = ? ";

            var query_var = [_hash];
        
        let _connection = this.connection;
        
        return new Promise(async (resolve, reject) => {
        // query the database
        var cnt = await _connection.query(query_str, query_var, (error, results) => {
        if(error){
            this.reconnectDatabase();
            reject(error);
        }
            resolve(true);   
        });
        
        });
        
    }

    // EVENTS

    // Insert Event of type Transfer in DB
    async insertTransfer(transfer) {

        // check we have right type of event. Event should be a transfer
        if(transfer.event == 'Transfer'){
       
        let sqltransfer = {
            transactionhash: transfer.transactionHash,
            from: transfer.returnValues.from,
            to: transfer.returnValues.to,
            amount : transfer.returnValues.tokens
        };
        
        let _connection = this.connection;
        return new Promise(async (resolve, reject) => {
        // Insert the database
        _connection.query('INSERT INTO transfers SET ?', sqltransfer, (error, results) => {

            if(error){
                this.reconnectDatabase();
                reject(error);
            }
            
            // Success
            resolve(results);
            });
        });
    
    }

    else {
        return 'wont insert this event in db as transfer, wrong type of event, not a transfer';
    }

    }


    async insertMint(mint) {

        // check we have right type of event. Event should be a mint
        if(mint.event == 'Mint'){
       
        let sqlmint = {
            transactionhash: mint.transactionHash,
            from: mint.returnValues.from,
            blockreward: mint.returnValues.blockreward,
            epochCount: mint.returnValues.epochCount,
            newChallengeNumber : mint.returnValues.newChallengeNumber
        };
        
        let _connection = this.connection;
        return new Promise(async (resolve, reject) => {
        // Insert the database
        _connection.query('INSERT INTO mints SET ?', sqlmint, (error, results) => {
            //if(error) reject(error);
            if(error){
                this.reconnectDatabase();
                reject(error);
            }
            
            // Success
            resolve(results);
            });
        });
    
    }

    else {
        return 'wont insert this event in db as mint, wrong type of event, not a mint';
    }

    }







// Insert Event of type NewProposal in DB
async insertNewProposal(newproposal) {

    // check we have right type of event. Event should be a NewProposal
    if(newproposal.event == 'NewProposal'){
   
    let sqlnewproposal = {
        transactionhash: newproposal.transactionHash,
        proposed_release_hash: newproposal.returnValues.proposed_release_hash,
        proposer: newproposal.returnValues._proposer,
        diseasehash: newproposal.returnValues.diseasehash,
        chunkid : newproposal.returnValues.chunkid
    };
    
    let _connection = this.connection;
    return new Promise(async (resolve, reject) => {
    // Insert the database
    _connection.query('INSERT INTO newproposals SET ?', sqlnewproposal, (error, results) => {
        //if(error) reject(error);
        if(error){
            this.reconnectDatabase();
            reject(error);
        }
        
        // Success
        //console.log('Newproposal event added to DB');
        //console.log(results);
        resolve(results);
        });
    });

}

else {
    return 'wont insert this event in db as newproposal, wrong type of event, not a newproposal';
}

    }


   // Insert Event of type NewChunk in DB
   async insertNewChunk(newchunk) {

    // check we have right type of event. Event should be a NewChunk
    if(newchunk.event == 'NewChunk'){
   
    let sqlnewchunk = {
        transactionhash: newchunk.transactionHash,
        diseasehash: newchunk.returnValues.diseasehash,
        chunkid : newchunk.returnValues.chunkid
    };
    
    let _connection = this.connection;
    return new Promise(async (resolve, reject) => {
    // Insert the database
    _connection.query('INSERT INTO newchunks SET ?', sqlnewchunk, (error, results) => {
        //if(error) reject(error);
        if(error){
            this.reconnectDatabase();
            reject(error);
        }
        
        // Success
        //console.log('Newchunk event added to DB');
        //console.log(results);
        resolve(results);
        });
    });

}

else {
    return 'wont insert this event in db as newchunk, wrong type of event, not a newchunk';
}

    }


    // Insert Event of type NewChunk in DB
   async insertNewCommit(newcommit) {

    // check we have right type of event. Event should be a NewChunk
    if(newcommit.event == 'NewCommit'){
   
    let sqlnewcommit = {
        transactionhash: newcommit.transactionHash,
        voter: newcommit.returnValues._voter,
        votehash: newcommit.returnValues.votehash,
        amount: newcommit.returnValues.amount
    };
    
    let _connection = this.connection;
    return new Promise(async (resolve, reject) => {
    // Insert the database
    _connection.query('INSERT INTO newcommits SET ?', sqlnewcommit, (error, results) => {
        //if(error) reject(error);
        if(error){
            this.reconnectDatabase();
            reject(error);
        }
        
        // Success
        //console.log('Newcommit event added to DB');
        //console.log(results);
        resolve(results);
        });
    });

}

else {
    return 'wont insert this event in db as newcommit, wrong type of event, not a newcommit';
}

    }


    // Insert Event of type NewDisease in DB
    async insertNewDisease(newdisease) {

        // check we have right type of event. Event should be a NewDisease
        if(newdisease.event == 'NewDisease'){
       
        let sqlnewdisease = {
            transactionhash: newdisease.transactionHash,
            diseaseindex: newdisease.returnValues.diseaseindex,
            title: newdisease.returnValues.title
        };
        
        let _connection = this.connection;
        return new Promise(async (resolve, reject) => {
        // Insert the database
        _connection.query('INSERT INTO newdiseases SET ?', sqlnewdisease, (error, results) => {
            //if(error) reject(error);
            if(error){
                this.reconnectDatabase();
                reject(error);
            }
            
            // Success
            //console.log('Newdisease event added to DB');
            //console.log(results);
            resolve(results);
            });
        });
    
    }

    else {
        return 'wont insert this event in db as newdisease, wrong type of event, not a newdisease';
    }

        }
        
        
    // Insert Event of type NewFee in DB
    async insertNewFee(newfee) {

        // check we have right type of event. Event should be a NewFee
        if(newfee.event == 'NewFee'){
       
        let sqlnewfee = {
            transactionhash: newfee.transactionHash,
            voter : newfee.returnValues.voter,
            fee: newfee.returnValues.fee,
            proposal_hash: newfee.returnValues.proposal_hash
        };
        
        let _connection = this.connection;
        return new Promise(async (resolve, reject) => {
        // Insert the database
        _connection.query('INSERT INTO newfees SET ?', sqlnewfee, (error, results) => {
            //if(error) reject(error);
            if(error){
                this.reconnectDatabase();
                reject(error);
            }
            
            // Success
            //console.log('Newfee event added to DB');
            //console.log(results);
            resolve(results);
            });
        });
    
    }

    else {
        return 'wont insert this event in db as newfee, wrong type of event, not a newfee';
    }

        }
        
        

            // Insert Event of type NewReveal in DB
            async insertNewReveal(newreveal) {

                // check we have right type of event. Event should be a NewReveal
                if(newreveal.event == 'NewReveal'){
               
                let sqlnewreveal = {
                    transactionhash: newreveal.transactionHash,
                    voter : newreveal.returnValues._voter,
                    proposal_hash: newreveal.returnValues._proposal,
                    amount: newreveal.returnValues.amount
                };
                
                let _connection = this.connection;
                return new Promise(async (resolve, reject) => {
                // Insert the database
                _connection.query('INSERT INTO newreveals SET ?', sqlnewreveal, (error, results) => {
                    //if(error) reject(error);
                    if(error){
                        this.reconnectDatabase();
                        reject(error);
                    }
                    
                    // Success
                    //console.log('Newreveal event added to DB');
                    //console.log(results);
                    resolve(results);
                    });
                });
            
            }
        
            else {
                return 'wont insert this event in db as newreveal, wrong type of event, not a newreveal';
            }
        
                }    



            // Insert Event of type NewSlash in DB
            async insertNewSlash(newslash) {
                console.log('Starting insert newslash');
                console.log('Starting insert newslash', newslash);
                // check we have right type of event. Event should be a NewSlash
                if(newslash.event == 'NewSlash'){
               
                let sqlnewslash = {
                    transactionhash: newslash.transactionHash,
                    voter: newslash.returnValues.voter,
                    proposal_hash: newslash.returnValues.proposal_hash,
                    duration: newslash.returnValues.duration,
                    amount: newslash.returnValues.amount
                };
                
                let _connection = this.connection;
                return new Promise(async (resolve, reject) => {
                // Insert the database
                _connection.query('INSERT INTO newslashs SET ?', sqlnewslash, (error, results) => {
                    //if(error) reject(error);
                    if(error){
                        this.reconnectDatabase();
                        reject(error);
                    }
                    
                    // Success
                    console.log('Newslash event added to DB');
                    console.log(results);
                    resolve(results);
                    });
                });
            
            }
        
            else {
                return 'wont insert this event in db as newslash, wrong type of event, not a newslash';
            }
        
                }



            // Insert Event of type NewStakes in DB
            async insertNewStake(newstake) {

                // check we have right type of event. Event should be a NewStake
                if(newstake.event == 'NewStake'){
               
                let sqlnewstake = {
                    transactionhash: newstake.transactionHash,
                    staker : newstake.returnValues.staker,
                    amount: newstake.returnValues.amount
                };
                
                let _connection = this.connection;
                return new Promise(async (resolve, reject) => {
                // Insert the database
                _connection.query('INSERT INTO newstakes SET ?', sqlnewstake, (error, results) => {
                    //if(error) reject(error);
                    if(error){
                        this.reconnectDatabase();
                        reject(error);
                    }
                    
                    // Success
                    //console.log('Newstake event added to DB');
                    //console.log(results);
                    resolve(results);
                    });
                });
            
            }
        
            else {
                return 'wont insert this event in db as newstake, wrong type of event, not a newstake';
            }
        
                }


                // Insert Event of type StakeClaim in DB
            async insertStakeClaim(stakeclaim) {

                // check we have right type of event. Event should be a StakeClaim
                if(stakeclaim.event == 'StakeClaim'){
               
                let sqlstakeclaim = {
                    transactionhash: stakeclaim.transactionHash,
                    staker : stakeclaim.returnValues.staker,
                    stakeamount: stakeclaim.returnValues.stakeamount
                };
                
                let _connection = this.connection;
                return new Promise(async (resolve, reject) => {
                // Insert the database
                _connection.query('INSERT INTO stakeclaims SET ?', sqlstakeclaim, (error, results) => {
                    //if(error) reject(error);
                    if(error){
                        this.reconnectDatabase();
                        reject(error);
                    }
                    
                    // Success
                    //console.log('StakeClaim event added to DB');
                    //console.log(results);
                    resolve(results);
                    });
                });
            
            }
        
            else {
                return 'wont insert this event in db as stakeclaim, wrong type of event, not a stakeclaim';
            }
        
                }


                // Insert Event of type RewardClaim in DB
                async insertRewardClaim(rewardclaim) {

                    // check we have right type of event. Event should be a RewardClaim
                    if(rewardclaim.event == 'RewardClaimed'){
                   
                    let sqlrewardclaim = {
                        transactionhash: rewardclaim.transactionHash,
                        voter : rewardclaim.returnValues.voter,
                        proposal_hash : rewardclaim.returnValues.proposal_hash,
                        amount: rewardclaim.returnValues.amount
                    };
                    
                    let _connection = this.connection;
                    return new Promise(async (resolve, reject) => {
                    // Insert the database
                    _connection.query('INSERT INTO rewardclaims SET ?', sqlrewardclaim, (error, results) => {
                        //if(error) reject(error);
                        if(error){
                            this.reconnectDatabase();
                            reject(error);
                        }
                        
                        // Success
                        //console.log('rewardClaim event added to DB');
                        //console.log(results);
                        resolve(results);
                        });
                    });
                
                }
            
                else {
                    return 'wont insert this event in db as rewardclaim, wrong type of event, not a rewardclaim';
                }
            
                    }



               // Insert Event of type Stakescsldted in DB
            async insertNewStakesclsdt(newstakescsldt) {

                // check we have right type of event. Event should be a NewStake
                if(newstakescsldt.event == 'NewStakescsldt'){
               
                let sqlnewstakescsldt = {
                    staker : newstakescsldt.returnValues.staker,
                    endtime: newstakescsldt.returnValues.endtime,
                    minlimit : newstakescsldt.returnValues.minlimit
                };
                
                let _connection = this.connection;
                return new Promise(async (resolve, reject) => {
                // Insert the database
                _connection.query('INSERT INTO newstakescsldts SET ?', sqlnewstakescsldt, (error, results) => {
                    //if(error) reject(error);
                    if(error){
                        this.reconnectDatabase();
                        reject(error);
                    }
                    
                    resolve(results);
                    });
                });
            
            }
        
            else {
                return 'wont insert this event in db as newstakescsldt, wrong type of event, not a newstakescsldt';
            }
        
                }  
                
                
            
                   // Insert Event of type NewStakesnap in DB
            async insertNewStakesnap(newstakesnap) {

                // check we have right type of event. Event should be a NewStake
                if(newstakesnap.event == 'NewStakesnap'){
               
                let sqlnewstakesnap = {
                    staker : newstakesnap.returnValues.staker,
                    snapamount: newstakesnap.returnValues.snapamount
                };
                
                let _connection = this.connection;
                return new Promise(async (resolve, reject) => {
                // Insert the database
                _connection.query('INSERT INTO newstakesnaps SET ?', sqlnewstakesnap, (error, results) => {
                    //if(error) reject(error);
                    if(error){
                        this.reconnectDatabase();
                        reject(error);
                    }
                    
                    resolve(results);
                    });
                });
            
            }
        
            else {
                return 'wont insert this event in db as newstakesnap, wrong type of event, not a newstakesnap';
            }
        
                }  




            // Insert Event of type TieClaimed in DB
            async insertTieClaimed(newtieclaim) {

                // check we have right type of event. Event should be a TieClaimed
                if(newtieclaim.event == 'TieClaimed'){
               
                let sqlnewtieclaim = {
                    transactionhash: newtieclaim.transactionHash,
                    voter: newtieclaim.returnValues.voter,
                    proposal_hash: newtieclaim.returnValues.proposal_hash
                };
                
                let _connection = this.connection;
                return new Promise(async (resolve, reject) => {
                // Insert the database
                _connection.query('INSERT INTO tieclaims SET ?', sqlnewtieclaim, (error, results) => {
                    //if(error) reject(error);
                    if(error){
                        this.reconnectDatabase();
                        reject(error);
                    }
                    
                    // Success
                    //console.log('Newreveal event added to DB');
                    //console.log(results);
                    resolve(results);
                    });
                });
            
            }
        
            else {
                return 'wont insert this event in db as newtieclaim, wrong type of event, not a newtieclaim';
            }
        
                }
                
                
                // Insert Event of type CreatedPeriod in DB
            async insertNewPeriod(newperiod) {

                // check we have right type of event. Event should be a NewStake
                if(newperiod.event == 'CreatedPeriod'){
               
                let sqlnewperiod = {
                    transactionhash: newperiod.transactionHash,
                    periodid : newperiod.returnValues.period_id,
                    interval: newperiod.returnValues.interval
                };
                
                let _connection = this.connection;
                return new Promise(async (resolve, reject) => {
                // Insert the database
                _connection.query('INSERT INTO newperiods SET ?', sqlnewperiod, (error, results) => {
                    //if(error) reject(error);
                    if(error){
                        this.reconnectDatabase();
                        reject(error);
                    }
                    
                    // Success
                    //console.log('Newperiodevent added to DB');
                    //console.log(results);
                    resolve(results);
                    });
                });
            
            }
        
            else {
                return 'wont insert this event in db as newperiod, wrong type of event, not a newperiod';
            }
        
                }
    

}

module.exports = DbTransactionMYSQL;