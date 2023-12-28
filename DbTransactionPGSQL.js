const DbHandler = require("./DbHanlder.js");
let pgsql = require('pg');

class DbTransactionPGSQL {
    constructor() {
        this.initDatabaseConnection();
    }

    async initDatabaseConnection() {

        // Logic for PostgreSQL connection
        this.connection = await pgsql.connect({
            host: this.options.PGSQL_HOST,
            user: this.options.PGSQL_USER,
            password: this.options.PGSQL_PASSWORD,
            database: this.options.PGSQL_DATABASE,
            port: this.options.PGSQL_PORT,
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
            await _connection.query('INSERT INTO blocks (number, hash, parenthash, nonce, sha3Uncles, logsBloom, transactionsRoot, stateRoot, miner, difficulty, totalDifficulty, extraData, size, gasLimit, gasUsed, timestamp, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)',
                [sqlblock.number, sqlblock.hash, sqlblock.parenthash, sqlblock.nonce, sqlblock.sha3Uncles, sqlblock.logsBloom, sqlblock.transactionsRoot, sqlblock.stateRoot, sqlblock.miner, sqlblock.difficulty, sqlblock.totalDifficulty, sqlblock.extraData, sqlblock.size, sqlblock.gasLimit, sqlblock.gasUsed, sqlblock.timestamp, sqlblock.created_at, sqlblock.updated_at],
                (error, results) => {
                    if (error != null) {
                        this.reconnectDatabase();
                        reject(error);
                    }
    
                    if (results.rowCount > 0) {
                        resolve(results.rows[0].id);
                    } else {
                        reject(error);
                    }
                });
        });
    }


    async insertEtransaction(tx, dbblockid) {
        let sqltransaction = {
            block_id: dbblockid,
            blockNumber: tx.blockNumber,
            blockHash: tx.blockHash,
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
        if (tx.input === '0x') {
            sqltransaction.eventtype = 1;
        }
    
        let _connection = this.connection; // Assuming this.connection is the PostgreSQL connection connection
    
        return new Promise(async (resolve, reject) => {
            _connection.query('INSERT INTO etransactions(block_id, blockNumber, blockHash, hash, nonce, transactionIndex, from, to, value, gas, gasPrice, input, created_at, updated_at, eventtype) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
                [sqltransaction.block_id, sqltransaction.blockNumber, sqltransaction.blockHash, sqltransaction.hash, sqltransaction.nonce, sqltransaction.transactionIndex, sqltransaction.from, sqltransaction.to, sqltransaction.value, sqltransaction.gas, sqltransaction.gasPrice, sqltransaction.input, sqltransaction.created_at, sqltransaction.updated_at, sqltransaction.eventtype],
                (error, results) => {
                    if (error) {
                        this.reconnectDatabase();
                        reject(error);
                    }
                    resolve(results);
                });
        });
    }


    async updateEtransaction(txhash, _eventtype) {
        let sqleventtype = {
            eventtype: _eventtype,
            hash: txhash
        };
    
        let _connection = this.connection; // Assuming this.connection is the PostgreSQL connection connection
    
        return new Promise(async (resolve, reject) => {
            _connection.query('INSERT INTO stagingupdates(eventtype, hash) VALUES ($1, $2)', [sqleventtype.eventtype, sqleventtype.hash], (error, results) => {
                if (error) {
                    this.reconnectDatabase();
                    reject(error);
                }
                resolve(results);
            });
        });
    }


    async getLastEtransaction() {
        const queryStr = `
            SELECT *
            FROM etransactions
            ORDER BY id DESC
            LIMIT 1
        `;
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const result = await connection.query(queryStr);
                
                if (result.rows.length > 0) {
                    resolve(result.rows[0].id);
                } else {
                    resolve([]);
                }
            } catch (error) {
                this.reconnectDatabase(); // Reconnect logic here
                reject(error);
            }
        });
    }



    async checkTxsStatus(CheckTxsFailureIndex) {
        const queryStr = `
            SELECT *
            FROM etransactions
            WHERE (id > $1 AND value = 0 AND eventtype IS NULL AND eticatransf IS NULL)
        `;
        
        const queryVar = [CheckTxsFailureIndex];
        const client = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const result = await client.query(queryStr, queryVar);
    
                if (result.rows.length > 0) {
                    resolve(result.rows);
                } else {
                    resolve([]);
                }
            } catch (error) {
                this.reconnectDatabase(); // Reconnect logic here
                reject(error);
            }
        });
    }


    async updateTxFailure(_tx) {
        const txhash = _tx.hash;
        const sqlupdatetx = [0, txhash]; // Assuming `status` is an integer in the database
        
        const client = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                await client.query('UPDATE etransactions SET status = $1 WHERE hash = $2', sqlupdatetx);
                resolve('Update successful');
            } catch (error) {
                this.reconnectDatabase(); // Reconnect logic here
                reject(error);
            }
        });
    }
    

    async checkBlockindb(block, _block_latestdb) {
        var query_str =
            "SELECT * " +
            "FROM blocks " +
            "WHERE id > $1 " +
            "AND (number = $2) " +
            "LIMIT 1 ";
    
        let max_search_id = _block_latestdb.id - 1000; // search only on last 1000 blocks
        var query_var = [max_search_id, block.number];
    
        let _connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            // query the database
            _connection.query(query_str, query_var, (error, results) => {
                if (error) {
                    this.reconnectDatabase();
                    reject(error);
                }
    
                if (typeof results !== 'undefined' && results.rows.length > 0) {
                    // block is in DB
                    resolve(true);
                } else {
                    // block is not in DB yet
                    resolve(false);
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
            _connection.query(query_str, (error, results) => {
                if (error) {
                    this.reconnectDatabase();
                    reject(error);
                }
    
                if (results && results.rows.length > 0 && results.rows[0].number > 0) {
                    // results.rows[0] should contain block from DB
                    resolve(results.rows[0]);
                } else {
                    // block is not in DB yet or an error occurred
                    reject('Error retrieving block or block not found');
                }
            });
        });
    }


    async getmissingtxs() {
        const query_str = `
            SELECT *
            FROM stagingupdates
            WHERE txmissing = 1
        `;
    
        const connection = this.connection; // Assuming this.pool is the PostgreSQL client or pool
    
        return new Promise(async (resolve, reject) => {
            try {
                const results = await connection.query(query_str);
                
                if (results && results.rows.length > 0) {
                    resolve(results.rows);
                } else {
                    const nomissingtxs = [];
                    resolve(nomissingtxs);
                }
            } catch (error) {
                this.reconnectDatabase(); // Reconnect logic here
                reject(error);
            }
        });
    }




    async getdbidBlock(blockNumber) {
        const queryStr = `
            SELECT *
            FROM blocks
            WHERE number = $1
            LIMIT 1
        `;
        const sqlBlock = [blockNumber];
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const results = await connection.query(queryStr, sqlBlock);
                
                if (results && results.rows.length > 0) {
                    const blockResult = results.rows[0];
                    if (blockResult.id > 0) {
                        resolve(blockResult.id);
                    } else {
                        reject('Error: Unexpected block data format from the database.');
                    }
                } else {
                    reject('Error: Failed to retrieve block from the database.');
                }
            } catch (error) {
                this.reconnectDatabase(); // Reconnect logic here
                reject(error);
            }
        });
    }


    async deleteStaging(hash) {
        const queryStr = `
            DELETE FROM stagingupdates
            WHERE hash = $1
        `;
        const queryVar = [hash];
    
        const connection = this.connection; // Assuming this.pool is the PostgreSQL client or pool
    
        return new Promise(async (resolve, reject) => {
            try {
                await connection.query(queryStr, queryVar);
                resolve(true);
            } catch (error) {
                this.reconnectDatabase(); // Reconnect logic here
                reject(error);
            }
        });
    }


    // EVENTS

    async insertTransfer(transfer) {
        // Check we have the right type of event. Event should be a transfer
        if (transfer.event === 'Transfer') {
            let sqltransfer = {
                transactionhash: transfer.transactionHash,
                from_address: transfer.returnValues.from,
                to_address: transfer.returnValues.to,
                amount: transfer.returnValues.tokens
            };
    
            let _connection = this.connection;
    
            return new Promise(async (resolve, reject) => {
                // Insert into the database
                _connection.query('INSERT INTO transfers(transactionhash, from_address, to_address, amount) VALUES ($1, $2, $3, $4)', 
                [sqltransfer.transactionhash, sqltransfer.from_address, sqltransfer.to_address, sqltransfer.amount],
                (error, results) => {
                    if (error) {
                        this.reconnectDatabase();
                        reject(error);
                    }
    
                    // Success
                    resolve(results);
                });
            });
        } else {
            return 'Won\'t insert this event in the database as transfer; wrong type of event, not a transfer';
        }
    }


    async insertMint(mint) {
        // Check we have the right type of event. Event should be a mint
        if (mint.event === 'Mint') {
            let sqlmint = {
                transactionhash: mint.transactionHash,
                from_address: mint.returnValues.from,
                blockreward: mint.returnValues.blockreward,
                epochCount: mint.returnValues.epochCount,
                newChallengeNumber: mint.returnValues.newChallengeNumber
            };
    
            let _connection = this.connection;
    
            return new Promise(async (resolve, reject) => {
                // Insert into the database
                _connection.query('INSERT INTO mints(transactionhash, from_address, blockreward, epochCount, newChallengeNumber) VALUES ($1, $2, $3, $4, $5)', 
                [sqlmint.transactionhash, sqlmint.from_address, sqlmint.blockreward, sqlmint.epochCount, sqlmint.newChallengeNumber],
                (error, results) => {
                    if (error) {
                        this.reconnectDatabase();
                        reject(error);
                    }
    
                    // Success
                    resolve(results);
                });
            });
        } else {
            return 'Won\'t insert this event in the database as mint; wrong type of event, not a mint';
        }
    }





    async insertNewProposal(newproposal) {
        if (newproposal.event !== 'NewProposal') {
            return 'Wrong type of event, not a NewProposal';
        }
    
        const sqlnewproposal = {
            transactionhash: newproposal.transactionHash,
            proposed_release_hash: newproposal.returnValues.proposed_release_hash,
            proposer: newproposal.returnValues._proposer,
            diseasehash: newproposal.returnValues.diseasehash,
            chunkid: newproposal.returnValues.chunkid
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO newproposals(transactionhash, proposed_release_hash, proposer, diseasehash, chunkid) VALUES($1, $2, $3, $4, $5)';
                const values = [sqlnewproposal.transactionhash, sqlnewproposal.proposed_release_hash, sqlnewproposal.proposer, sqlnewproposal.diseasehash, sqlnewproposal.chunkid];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }
    
    async insertNewChunk(newchunk) {
        if (newchunk.event !== 'NewChunk') {
            return 'Wrong type of event, not a NewChunk';
        }
    
        const sqlnewchunk = {
            transactionhash: newchunk.transactionHash,
            diseasehash: newchunk.returnValues.diseasehash,
            chunkid: newchunk.returnValues.chunkid
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO newchunks(transactionhash, diseasehash, chunkid) VALUES($1, $2, $3)';
                const values = [sqlnewchunk.transactionhash, sqlnewchunk.diseasehash, sqlnewchunk.chunkid];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }


    async insertNewCommit(newcommit) {
        if (newcommit.event !== 'NewCommit') {
            return 'Wrong type of event, not a NewCommit';
        }
    
        const sqlnewcommit = {
            transactionhash: newcommit.transactionHash,
            voter: newcommit.returnValues._voter,
            votehash: newcommit.returnValues.votehash,
            amount: newcommit.returnValues.amount
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO newcommits(transactionhash, voter, votehash, amount) VALUES($1, $2, $3, $4)';
                const values = [sqlnewcommit.transactionhash, sqlnewcommit.voter, sqlnewcommit.votehash, sqlnewcommit.amount];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }
    
    async insertNewDisease(newdisease) {
        if (newdisease.event !== 'NewDisease') {
            return 'Wrong type of event, not a NewDisease';
        }
    
        const sqlnewdisease = {
            transactionhash: newdisease.transactionHash,
            diseaseindex: newdisease.returnValues.diseaseindex,
            title: newdisease.returnValues.title
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO newdiseases(transactionhash, diseaseindex, title) VALUES($1, $2, $3)';
                const values = [sqlnewdisease.transactionhash, sqlnewdisease.diseaseindex, sqlnewdisease.title];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }
    
    async insertNewFee(newfee) {
        if (newfee.event !== 'NewFee') {
            return 'Wrong type of event, not a NewFee';
        }
    
        const sqlnewfee = {
            transactionhash: newfee.transactionHash,
            voter: newfee.returnValues.voter,
            fee: newfee.returnValues.fee,
            proposal_hash: newfee.returnValues.proposal_hash
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO newfees(transactionhash, voter, fee, proposal_hash) VALUES($1, $2, $3, $4)';
                const values = [sqlnewfee.transactionhash, sqlnewfee.voter, sqlnewfee.fee, sqlnewfee.proposal_hash];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }


    async insertNewReveal(newreveal) {
        if (newreveal.event !== 'NewReveal') {
            return 'Wrong type of event, not a NewReveal';
        }
    
        const sqlnewreveal = {
            transactionhash: newreveal.transactionHash,
            voter: newreveal.returnValues._voter,
            proposal_hash: newreveal.returnValues._proposal,
            amount: newreveal.returnValues.amount
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO newreveals(transactionhash, voter, proposal_hash, amount) VALUES($1, $2, $3, $4)';
                const values = [sqlnewreveal.transactionhash, sqlnewreveal.voter, sqlnewreveal.proposal_hash, sqlnewreveal.amount];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }
    
    async insertNewSlash(newslash) {
        if (newslash.event !== 'NewSlash') {
            return 'Wrong type of event, not a NewSlash';
        }
    
        const sqlnewslash = {
            transactionhash: newslash.transactionHash,
            voter: newslash.returnValues.voter,
            proposal_hash: newslash.returnValues.proposal_hash,
            duration: newslash.returnValues.duration,
            amount: newslash.returnValues.amount
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO newslashs(transactionhash, voter, proposal_hash, duration, amount) VALUES($1, $2, $3, $4, $5)';
                const values = [sqlnewslash.transactionhash, sqlnewslash.voter, sqlnewslash.proposal_hash, sqlnewslash.duration, sqlnewslash.amount];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }
    
    async insertNewStake(newstake) {
        if (newstake.event !== 'NewStake') {
            return 'Wrong type of event, not a NewStake';
        }
    
        const sqlnewstake = {
            transactionhash: newstake.transactionHash,
            staker: newstake.returnValues.staker,
            amount: newstake.returnValues.amount
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO newstakes(transactionhash, staker, amount) VALUES($1, $2, $3)';
                const values = [sqlnewstake.transactionhash, sqlnewstake.staker, sqlnewstake.amount];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }


    async insertStakeClaim(stakeclaim) {
        if (stakeclaim.event !== 'StakeClaim') {
            return 'Wrong type of event, not a StakeClaim';
        }
    
        const sqlstakeclaim = {
            transactionhash: stakeclaim.transactionHash,
            staker: stakeclaim.returnValues.staker,
            stakeamount: stakeclaim.returnValues.stakeamount
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO stakeclaims(transactionhash, staker, stakeamount) VALUES($1, $2, $3)';
                const values = [sqlstakeclaim.transactionhash, sqlstakeclaim.staker, sqlstakeclaim.stakeamount];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }
    
    async insertRewardClaim(rewardclaim) {
        if (rewardclaim.event !== 'RewardClaimed') {
            return 'Wrong type of event, not a RewardClaimed';
        }
    
        const sqlrewardclaim = {
            transactionhash: rewardclaim.transactionHash,
            voter: rewardclaim.returnValues.voter,
            proposal_hash: rewardclaim.returnValues.proposal_hash,
            amount: rewardclaim.returnValues.amount
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO rewardclaims(transactionhash, voter, proposal_hash, amount) VALUES($1, $2, $3, $4)';
                const values = [sqlrewardclaim.transactionhash, sqlrewardclaim.voter, sqlrewardclaim.proposal_hash, sqlrewardclaim.amount];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }
    
    async insertNewStakesclsdt(newstakescsldt) {
        if (newstakescsldt.event !== 'NewStakescsldt') {
            return 'Wrong type of event, not a NewStakescsldt';
        }
    
        const sqlnewstakescsldt = {
            staker: newstakescsldt.returnValues.staker,
            endtime: newstakescsldt.returnValues.endtime,
            minlimit: newstakescsldt.returnValues.minlimit
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO newstakescsldts(staker, endtime, minlimit) VALUES($1, $2, $3)';
                const values = [sqlnewstakescsldt.staker, sqlnewstakescsldt.endtime, sqlnewstakescsldt.minlimit];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }


    async insertNewStakesnap(newstakesnap) {
        if (newstakesnap.event !== 'NewStakesnap') {
            return 'Wrong type of event, not a NewStakesnap';
        }
    
        const sqlnewstakesnap = {
            staker: newstakesnap.returnValues.staker,
            snapamount: newstakesnap.returnValues.snapamount
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO newstakesnaps(staker, snapamount) VALUES($1, $2)';
                const values = [sqlnewstakesnap.staker, sqlnewstakesnap.snapamount];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }
    
    async insertTieClaimed(newtieclaim) {
        if (newtieclaim.event !== 'TieClaimed') {
            return 'Wrong type of event, not a TieClaimed';
        }
    
        const sqlnewtieclaim = {
            transactionhash: newtieclaim.transactionHash,
            voter: newtieclaim.returnValues.voter,
            proposal_hash: newtieclaim.returnValues.proposal_hash
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO tieclaims(transactionhash, voter, proposal_hash) VALUES($1, $2, $3)';
                const values = [sqlnewtieclaim.transactionhash, sqlnewtieclaim.voter, sqlnewtieclaim.proposal_hash];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }
    
    async insertNewPeriod(newperiod) {
        if (newperiod.event !== 'CreatedPeriod') {
            return 'Wrong type of event, not a CreatedPeriod';
        }
    
        const sqlnewperiod = {
            transactionhash: newperiod.transactionHash,
            periodid: newperiod.returnValues.period_id,
            interval: newperiod.returnValues.interval
        };
    
        const connection = this.connection;
    
        return new Promise(async (resolve, reject) => {
            try {
                const queryText = 'INSERT INTO newperiods(transactionhash, periodid, interval) VALUES($1, $2, $3)';
                const values = [sqlnewperiod.transactionhash, sqlnewperiod.periodid, sqlnewperiod.interval];
    
                const result = await connection.query(queryText, values);
                resolve(result);
            } catch (error) {
                this.reconnectDatabase();
                reject(error);
            }
        });
    }






}

module.exports = DbTransactionPGSQL;