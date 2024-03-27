const knex = require('./db/knex.js');


class DbTransactionKnex {

    connection;

    constructor() {
        this.connection = knex;

        this.connection.on('query-error', (error) => {
            console.error('Database query error:', error);
            this.reconnectDatabase();
        });
    }

    reconnectDatabase() {
        console.log('\n New connection attempt...');
        //this.connection.destroy(); // Destroy the current connection
        //this.connection = knex({config});
    }


    async updatedbBlock(block) {
        console.log('inserting block with updatedbBlock', block.number);
        try {
            const insertedRows = await this.connection('blocks').insert({
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
            });
            console.log('results[0] is: ', insertedRows[0]);
            if(insertedRows[0] > 0){
                return insertedRows[0]; 
            }
            else {
                return null;
            }

        } catch (error) {
            console.error('Error inserting block:', error);
            this.reconnectDatabase();
            throw error;
        }
    }



    async insertEtransaction(tx, dbblockid) {
        try {
            const sqltransaction = {
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
                updated_at: new Date(),
                eventtype: tx.input === '0x' ? 1 : undefined,
            };

            const result = await this.connection('etransactions').insert(sqltransaction);
            return result[0]; // Assuming insertId is needed
        } catch (error) {
            console.error('Error inserting etransaction:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async updateEtransaction(txhash, _eventtype) {
        try {
            const sqleventtype = {
                eventtype: _eventtype,
                hash: txhash,
            };
            const result = await this.connection('stagingupdates').insert(sqleventtype);
            return result[0]; // Assuming insertId is needed
        } catch (error) {
            console.error('Error updating etransaction:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async getLastEtransaction() {
        try {
            const result = await this.connection('etransactions')
                .select('*')
                .orderBy('id', 'desc')
                .limit(1);

            if (result.length > 0) {
                return result[0].id; // Returns last etransactions row id
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching last etransaction:', error);
            this.reconnectDatabase();
            throw error;
        }
    }
    
    async checkTxsStatus(CheckTxsFailureIndex) {
        try {
            const results = await this.connection('etransactions')
                .select('*')
                .where('id', '>', CheckTxsFailureIndex)
                .andWhere('value', 0)
                .andWhere('eventtype', null)
                .andWhere('eticatransf', null);

            if (results.length > 0) {
                return results;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error checking transaction status:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async updateTxFailure(_tx) {
        try {
            const txhash = _tx.hash;
            const results = await this.connection('etransactions')
                .where('hash', txhash)
                .update({ status: 0 });

            return results;
        } catch (error) {
            console.error('Error updating transaction failure:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async checkBlockindb(block, _block_latestdb) {
        try {
            const max_serachid = _block_latestdb.id - 1000;
            const results = await this.connection('blocks')
                .select('*')
                .where('id', '>', max_serachid)
                .andWhere('number', block.number)
                .limit(1);

            return results.length > 0;
        } catch (error) {
            console.error('Error checking block in database:', error);
            this.reconnectDatabase();
            throw error;
        }
    }



    async getlatestdb() {
        try {
            const results = await this.connection('blocks')
                .select('*')
                .orderBy('id', 'desc')
                .limit(1);

            if (results.length > 0 && results[0].number > 0) {
                return results[0];
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error retrieving latest block:', error);
            this.reconnectDatabase();
            throw error;
        }
    }



    async existanyblockindb() {
        try {
            const results = await this.connection('blocks')
                .select('*')
                .orderBy('id', 'desc')
                .limit(1);
    
            if (results.length > 0 && results[0].number > 0) {
                return results[0];
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error retrieving latest block:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async getmissingtxs() {
        try {
            const results = await this.connection('stagingupdates')
                .select('*')
                .where('txmissing', 1);

            return results;
        } catch (error) {
            console.error('Error retrieving missing transactions:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async getdbidBlock(blocknumber) {
        try {
            const results = await this.connection('blocks')
                .select('*')
                .where('number', blocknumber)
                .limit(1);

            if (results.length > 0 && results[0].id > 0) {
                return results[0].id;
            } else {
                throw new Error('Error retrieving block ID from DB');
            }
        } catch (error) {
            console.error('Error retrieving block ID:', error);
            this.reconnectDatabase();
            throw error;
        }
    }




    async deletestaging(_hash) {
        try {
            const results = await this.connection('stagingupdates')
                .where('hash', _hash)
                .del();
            return true;
        } catch (error) {
            console.error('Error deleting staging:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async insertTransfer(transfer) {
        try {
            if (transfer.event === 'Transfer') {
                const sqltransfer = {
                    transactionhash: transfer.transactionHash,
                    from: transfer.returnValues.from,
                    to: transfer.returnValues.to,
                    amount: transfer.returnValues.tokens,
                };

                const results = await this.connection('transfers').insert(sqltransfer);
                return results;
            } else {
                return 'Won\'t insert this event in DB as transfer, wrong type of event, not a transfer';
            }
        } catch (error) {
            console.error('Error inserting transfer:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async insertMint(mint) {
        try {
            if (mint.event === 'Mint') {
                const sqlmint = {
                    transactionhash: mint.transactionHash,
                    from: mint.returnValues.from,
                    blockreward: mint.returnValues.blockreward,
                    epochCount: mint.returnValues.epochCount,
                    newChallengeNumber: mint.returnValues.newChallengeNumber,
                };

                const results = await this.connection('mints').insert(sqlmint);
                return results;
            } else {
                return 'Won\'t insert this event in DB as mint, wrong type of event, not a mint';
            }
        } catch (error) {
            console.error('Error inserting mint:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    async insertNewProposal(newproposal) {
        try {
            if (newproposal.event === 'NewProposal') {
                const sqlnewproposal = {
                    transactionhash: newproposal.transactionHash,
                    proposed_release_hash: newproposal.returnValues.proposed_release_hash,
                    proposer: newproposal.returnValues._proposer,
                    diseasehash: newproposal.returnValues.diseasehash,
                    chunkid: newproposal.returnValues.chunkid,
                };

                const results = await this.connection('newproposals').insert(sqlnewproposal);
                return results;
            } else {
                return 'Won\'t insert this event in DB as newproposal, wrong type of event, not a newproposal';
            }
        } catch (error) {
            console.error('Error inserting new proposal:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async insertNewChunk(newchunk) {
        try {
            if (newchunk.event === 'NewChunk') {
                const sqlnewchunk = {
                    transactionhash: newchunk.transactionHash,
                    diseasehash: newchunk.returnValues.diseasehash,
                    chunkid: newchunk.returnValues.chunkid,
                };

                const results = await this.connection('newchunks').insert(sqlnewchunk);
                return results;
            } else {
                return 'Won\'t insert this event in DB as newchunk, wrong type of event, not a newchunk';
            }
        } catch (error) {
            console.error('Error inserting new chunk:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async insertNewCommit(newcommit) {
        try {
            if (newcommit.event === 'NewCommit') {
                const sqlnewcommit = {
                    transactionhash: newcommit.transactionHash,
                    voter: newcommit.returnValues._voter,
                    votehash: newcommit.returnValues.votehash,
                    amount: newcommit.returnValues.amount,
                };

                const results = await this.connection('newcommits').insert(sqlnewcommit);
                return results;
            } else {
                return 'Won\'t insert this event in DB as newcommit, wrong type of event, not a newcommit';
            }
        } catch (error) {
            console.error('Error inserting new commit:', error);
            this.reconnectDatabase();
            throw error;
        }
    }



    async insertNewDisease(newdisease) {
        try {
            if (newdisease.event === 'NewDisease') {
                const sqlnewdisease = {
                    transactionhash: newdisease.transactionHash,
                    diseaseindex: newdisease.returnValues.diseaseindex,
                    title: newdisease.returnValues.title,
                };

                const results = await this.connection('newdiseases').insert(sqlnewdisease);
                return results;
            } else {
                return 'Won\'t insert this event in DB as newdisease, wrong type of event, not a newdisease';
            }
        } catch (error) {
            console.error('Error inserting new disease:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async insertNewFee(newfee) {
        try {
            if (newfee.event === 'NewFee') {
                const sqlnewfee = {
                    transactionhash: newfee.transactionHash,
                    voter: newfee.returnValues.voter,
                    fee: newfee.returnValues.fee,
                    proposal_hash: newfee.returnValues.proposal_hash,
                };

                const results = await this.connection('newfees').insert(sqlnewfee);
                return results;
            } else {
                return 'Won\'t insert this event in DB as newfee, wrong type of event, not a newfee';
            }
        } catch (error) {
            console.error('Error inserting new fee:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async insertNewReveal(newreveal) {
        try {
            if (newreveal.event === 'NewReveal') {
                const sqlnewreveal = {
                    transactionhash: newreveal.transactionHash,
                    voter: newreveal.returnValues._voter,
                    proposal_hash: newreveal.returnValues._proposal,
                    amount: newreveal.returnValues.amount,
                };

                const results = await this.connection('newreveals').insert(sqlnewreveal);
                return results;
            } else {
                return 'Won\'t insert this event in DB as newreveal, wrong type of event, not a newreveal';
            }
        } catch (error) {
            console.error('Error inserting new reveal:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async insertNewRecover(newrecover) {
        try {
            if (newrecover.event === 'NewRecover') {
                const sqlnewrecover = {
                    transactionhash: newrecover.transactionHash,
                    voter: newrecover.returnValues._voter,
                    proposal_hash: newrecover.returnValues._proposal,
                    amount: newrecover.returnValues.amount,
                };

                const results = await this.connection('newrecovers').insert(sqlnewrecover);
                return results;
            } else {
                return 'Won\'t insert this event in DB as newrecover, wrong type of event, not a newrecover';
            }
        } catch (error) {
            console.error('Error inserting new recover:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    
    async insertNewSlash(newslash) {
        try {
            if (newslash.event === 'NewSlash') {
                const sqlnewslash = {
                    transactionhash: newslash.transactionHash,
                    voter: newslash.returnValues.voter,
                    proposal_hash: newslash.returnValues.proposal_hash,
                    duration: newslash.returnValues.duration,
                    amount: newslash.returnValues.amount,
                };

                const results = await this.connection('newslashs').insert(sqlnewslash);
                return results;
            } else {
                return 'Won\'t insert this event in DB as newslash, wrong type of event, not a newslash';
            }
        } catch (error) {
            console.error('Error inserting new slash:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async insertNewStake(newstake) {
        try {
            if (newstake.event === 'NewStake') {
                const sqlnewstake = {
                    transactionhash: newstake.transactionHash,
                    staker: newstake.returnValues.staker,
                    amount: newstake.returnValues.amount,
                };

                const results = await this.connection('newstakes').insert(sqlnewstake);
                return results;
            } else {
                return 'Won\'t insert this event in DB as newstake, wrong type of event, not a newstake';
            }
        } catch (error) {
            console.error('Error inserting new stake:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async insertStakeClaim(stakeclaim) {
        try {
            if (stakeclaim.event === 'StakeClaim') {
                const sqlstakeclaim = {
                    transactionhash: stakeclaim.transactionHash,
                    staker: stakeclaim.returnValues.staker,
                    stakeamount: stakeclaim.returnValues.stakeamount,
                };

                const results = await this.connection('stakeclaims').insert(sqlstakeclaim);
                return results;
            } else {
                return 'Won\'t insert this event in DB as stakeclaim, wrong type of event, not a stakeclaim';
            }
        } catch (error) {
            console.error('Error inserting stake claim:', error);
            this.reconnectDatabase();
            throw error;
        }
    }



    async insertRewardClaim(rewardclaim) {
        try {
            if (rewardclaim.event === 'RewardClaimed') {
                const sqlrewardclaim = {
                    transactionhash: rewardclaim.transactionHash,
                    voter: rewardclaim.returnValues.voter,
                    proposal_hash: rewardclaim.returnValues.proposal_hash,
                    amount: rewardclaim.returnValues.amount,
                };

                const results = await this.connection('rewardclaims').insert(sqlrewardclaim);
                return results;
            } else {
                return 'Won\'t insert this event in DB as rewardclaim, wrong type of event, not a rewardclaim';
            }
        } catch (error) {
            console.error('Error inserting reward claim:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async insertNewStakescsldt(newstakescsldt) {
        try {
            if (newstakescsldt.event === 'NewStakescsldt') {
                const sqlnewstakescsldt = {
                    staker: newstakescsldt.returnValues.staker,
                    endtime: newstakescsldt.returnValues.endtime,
                    minlimit: newstakescsldt.returnValues.minlimit,
                };

                const results = await this.connection('newstakescsldts').insert(sqlnewstakescsldt);
                return results;
            } else {
                return 'Won\'t insert this event in DB as newstakescsldt, wrong type of event, not a newstakescsldt';
            }
        } catch (error) {
            console.error('Error inserting new stakescsldt:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async insertNewStakesnap(newstakesnap) {
        try {
            if (newstakesnap.event === 'NewStakesnap') {
                const sqlnewstakesnap = {
                    staker: newstakesnap.returnValues.staker,
                    snapamount: newstakesnap.returnValues.snapamount,
                };

                const results = await this.connection('newstakesnaps').insert(sqlnewstakesnap);
                return results;
            } else {
                return 'Won\'t insert this event in DB as newstakesnap, wrong type of event, not a newstakesnap';
            }
        } catch (error) {
            console.error('Error inserting new stakesnap:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    async insertTieClaimed(newtieclaim) {
        try {
            if (newtieclaim.event === 'TieClaimed') {
                const sqlnewtieclaim = {
                    transactionhash: newtieclaim.transactionHash,
                    voter: newtieclaim.returnValues.voter,
                    proposal_hash: newtieclaim.returnValues.proposal_hash,
                };

                const results = await this.connection('tieclaims').insert(sqlnewtieclaim);
                return results;
            } else {
                return 'Won\'t insert this event in DB as newtieclaim, wrong type of event, not a newtieclaim';
            }
        } catch (error) {
            console.error('Error inserting tie claim:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async insertNewPeriod(newperiod) {
        try {
            if (newperiod.event === 'CreatedPeriod') {
                const sqlnewperiod = {
                    transactionhash: newperiod.transactionHash,
                    periodid: newperiod.returnValues.period_id,
                    interval: newperiod.returnValues.interval,
                };

                const results = await this.connection('newperiods').insert(sqlnewperiod);
                return results;
            } else {
                return 'Won\'t insert this event in DB as newperiod, wrong type of event, not a newperiod';
            }
        } catch (error) {
            console.error('Error inserting new period:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    // Disease, chunks
    async diseasesnohash() {
        try {
            const results = await this.connection('newdiseases')
                .select('*')
                .where('diseasehash', '')
                .orWhereNull('diseasehash');
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving diseases:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async updatedisease(_fulldisease, _diseaseindex) {
        try {
            const _diseasehash = _fulldisease.disease_hash;
    
            const result = await this.connection('newdiseases')
                .where('diseaseindex', _diseaseindex)
                .update({ 'diseasehash': _diseasehash });
    
            return result;
        } catch (error) {
            console.error('Error updating disease:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async chunksnohash() {
        try {
            const results = await this.connection('newchunks')
                .whereNull('idx')
                .orWhere('idx', '')
                .select('*');
    
            if (results.length > 0) {
                return results;
            } else {
                // No chunks in the database
                return [];
            }
        } catch (error) {
            console.error('Error retrieving chunks:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async updatechunk(fullChunk, chunkId) {
        try {
            const { title, desc, idx } = fullChunk;
    
            const updatedRows = await this.connection('newchunks')
                .where('chunkid', chunkId)
                .update({ title, desc, idx });
    
            return updatedRows;
        } catch (error) {
            console.error('Error updating chunk:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async proposalsnoperiod() {
        try {
            const results = await this.connection('newproposals')
                .select('*')
                .whereNull('periodid')
                .orWhere('periodid', '');
    
            if (results.length > 0) {
                return results;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error retrieving proposals:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async updateproposal(_fullProposal, _proposedReleaseHash) {
        try {
            
            const proposalSql = {
                title: _fullProposal.title,
                description: _fullProposal.description,
                freefield: _fullProposal.freefield,
                raw_release_hash: _fullProposal.raw_release_hash,
                periodid: _fullProposal.period_id
            };
    
            const results = await this.connection('newproposals')
                .where('proposed_release_hash', _proposedReleaseHash)
                .update(proposalSql);
    
            return results;
        } catch (error) {
            console.error('Error updating proposal:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async insertpropsdata(_fullPropsData, _proposedReleaseHash, _proposalDbId) {
        try {
            const propsDataSql = {
                newproposal_id: _proposalDbId,
                proposalhash: _proposedReleaseHash,
                starttime: _fullPropsData.starttime,
                endtime: _fullPropsData.endtime,
                approvalthreshold: _fullPropsData.approvalthreshold
            };
    
            const results = await this.connection('propsdatas').insert(propsDataSql);
    
            return results;
        } catch (error) {
            console.error('Error inserting proposal data:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    async periodsnorewards() {
        try {
            const results = await this.connection('newperiods')
                .where(function () {
                    this.where('reward_for_editor', '')
                        .orWhereNull('reward_for_editor')
                        .orWhere('reward_for_curation', '')
                        .orWhereNull('reward_for_curation');
                });
    
            if (results.length > 0) {
                return results;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error querying periods without rewards:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    async updateperiod(_fullPeriod, _periodId) {
        try {
            const { reward_for_curation, reward_for_editor } = _fullPeriod;
    
            const periodSql = {
                reward_for_curation,
                reward_for_editor
            };
    
            const results = await this.connection('newperiods')
                .where('periodid', _periodId)
                .update(periodSql);
    
            return results;
        } catch (error) {
            console.error('Error updating period:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    async getstagingtx(staging, minIndex) {
        try {
            const results = await this.connection('etransactions')
                .select('*')
                .where('id', '>', minIndex)
                .where('hash', staging.hash)
                .limit(1);
    
            if (results.length > 0) {
                return results[0];
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching staging transaction:', error);
            this.reconnectmysql();
            throw error;
        }
    }
    
    async getstagingtransfer(transfer) {
        try {
            const results = await this.connection('stagingupdates')
                .select('*')
                .where('hash', transfer.transactionhash)
                .limit(1);
    
            if (results.length > 0) {
                return results[0];
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching staging transfer:', error);
            this.reconnectmysql();
            throw error;
        }
    }
    
    async gettransfertx(transfer, minIndex) {
        try {
            const results = await this.connection('etransactions')
                .select('*')
                .where('id', '>', minIndex)
                .where('hash', transfer.transactionhash)
                .limit(1);
    
            if (results.length > 0) {
                return results[0];
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching transfer transaction:', error);
            this.reconnectmysql();
            throw error;
        }
    }


    async getstagings() {
        try {
            const results = await this.connection('stagingupdates').select('*');
    
            if (results.length > 0) {
                return results;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching stagings:', error);
            this.reconnectmysql();
            throw error;
        }
    }
    
    async getblockfromtx(tx, minIndex) {
        try {
            const results = await this.connection('blocks')
                .select('*')
                .where('id', '>', minIndex)
                .where('id', tx.block_id)
                .limit(1);
    
            if (results.length > 0) {
                return results[0];
            } else {
                console.error('Block not found');
                return null;
            }
        } catch (error) {
            console.error('Error fetching block from transaction:', error);
            this.reconnectmysql();
            throw error;
        }
    }
    
    async updatetxtype(tx, staging) {
        try {
            const txhash = tx.hash;
            const eventtype = staging.eventtype;
    
            const updatedTx = await this.connection('etransactions')
                .where('hash', txhash)
                .update('eventtype', eventtype)
                .limit(1);
    
            return updatedTx;
        } catch (error) {
            console.error('Error updating transaction:', error);
            this.reconnectmysql();
            throw error;
        }
    }

    async updatettransfertimestamp(transfer, timestamp) {
        try {
            const transferId = transfer.id;
    
            const updatedTransfer = await this.connection('transfers')
                .where('id', transferId)
                .update('timestamp', timestamp)
                .limit(1);
    
            return updatedTransfer > 0;
        } catch (error) {
            console.error('Error updating transfer timestamp:', error);
            this.reconnectmysql();
            throw error;
        }
    }
    
    async setstagingmissingtx(staging) {
        try {
            const stagingHash = staging.hash;
    
            const updatedStaging = await this.connection('stagingupdates')
                .where('hash', stagingHash)
                .update('txmissing', 1)
                .limit(1);
    
            return updatedStaging;
        } catch (error) {
            console.error('Error setting staging as missing transaction:', error);
            this.reconnectmysql();
            throw error;
        }
    }

    async transfersnotimestamp(lasttransfersiddone) {
        try {
            const results = await this.connection('transfers')
                .where('id', '>', lasttransfersiddone)
                .where(function () {
                    this.where('timestamp', 0).orWhereNull('timestamp');
                });
    
            return results || [];
        } catch (error) {
            console.error('Error retrieving transfers without timestamp:', error);
            this.reconnectmysql();
            throw error;
        }
    }
    
    async insertstaging(newStaging) {
        try {
            const insertedStaging = await this.connection('stagingupdates')
                .insert({
                    eventtype: newStaging.eventtype,
                    hash: newStaging.hash,
                    txmissing: newStaging.txmissing
                });
    
            return insertedStaging[0] > 0;
        } catch (error) {
            console.error('Error inserting new staging:', error);
            this.reconnectmysql();
            throw error;
        }
    }


    // API
    async etransactionsPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('etransactions')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving etransactions:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    async blocksPaginated(page = 1, pageSize = 1000) {
        try {

            const totalCountQuery = await this.connection('blocks').count();
            const totalCount = totalCountQuery[0]['count(*)'];
            
            const results = await this.connection('blocks')
                .select('*')
                .orderBy('id', 'desc')
                .paginate({ perPage: pageSize, currentPage: page });
    
            return { totalCount, results };
        } catch (error) {
            console.error('Error retrieving blocks:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    async diseasesPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('newdiseases')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving diseases:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async proposalsPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('newproposals')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving proposals:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async chunksPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('newchunks')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving chunks:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async rewardclaimsPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('rewardclaims')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving rewardclaims:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async stakeclaimsPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('stakeclaims')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving stakeclaims:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    async newfeesPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('newfees')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving newfees:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    async newslashsPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('newslashs')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving newslashs:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    async newcommitsPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('newcommits')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving newcommits:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    async newrevealsPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('newreveals')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving newreveals:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async newstakesPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('newstakes')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving newstakes:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async transfersPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('transfers')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving transfers:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async mintsPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('mints')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving mints:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async newstakescsldtsPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('newstakescsldts')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving newstakescsldts:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async newstakesnapsPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('newstakesnaps')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving newstakesnaps:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async proposdatasPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('proposdatas')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving proposdatas:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async newperiodsPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('newperiods')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving newperiods:', error);
            this.reconnectDatabase();
            throw error;
        }
    }

    async newrecoversPaginated(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const results = await this.connection('newrecovers')
                .select('*')
                .limit(pageSize)
                .offset(offset);
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving newrecovers:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    async getPeriodProposals(periodid) {
        try {
            
            const results = await this.connection('proposals')
                .select('*')
                .where('periodid', periodid)
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving proposals:', error);
            this.reconnectDatabase();
            throw error;
        }
    }


    async getProposalReveals(proposal_hash) {
        try {
            
            const results = await this.connection('reveals')
                .select('*')
                .where('proposal', proposal_hash)
    
            return results.length > 0 ? results : [];
        } catch (error) {
            console.error('Error retrieving reveals of proposal:', error);
            this.reconnectDatabase();
            throw error;
        }
    }



}

module.exports = DbTransactionKnex;