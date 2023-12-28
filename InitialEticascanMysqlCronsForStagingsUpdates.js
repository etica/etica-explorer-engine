const axios = require('axios');
let mysql = require('mysql');

class CronsHandler {

    connection;
    lasttransfersiddone;

    constructor(_lasttransfersiddone) {
        
      this.connection = mysql.createConnection({
        host : '10.110.0.4',
        user : 'eticaengineuser',
        password : 'abc123',
        database : 'eticaenginedb',
        port: 3306
    });

      this.lasttransfersiddone = _lasttransfersiddone;
      console.log('cronshandler loaded');

    }


        //- Reconnection function
        reconnectmysql(){
          console.log("\n New connection tentative...");
      
          //- Destroy the current connection variable
          if(this.connection) this.connection.destroy();
      
          //- Create a new one
          this.connection = mysql.createConnection({
              host : '10.110.0.4',
              user : 'eticaengineuser',
              password : 'abc123',
              database : 'eticaenginedb',
              port: 3306
          });
      }


// --------- MAIN FUNCTIONS ---------- //


// Main function, intial call to update txs eventtypes thanks to stagings. Deletes stagings once tx updated or Updates stagings as missingtx if tx not found
async updatesatgings(){

  this.getstagings().then(async (stagingupdates) => {

    for (let onestaging of stagingupdates) {
    //console.log('updating onestaging', onestaging.id);

    // max 50 at once, otherwise the script queries will take too long and the setInterval function will call agin causing the stop of the process before it can be finished and the script will keep looping:
   
      await this.getstagingtx(onestaging).then(async (tx) => {
        if (tx && tx != null){
          //console.log('onestaging tx is', tx.id);
          //console.log('updating tx.eventtype', tx.id);
          await this.updatetx(tx, onestaging).then(async () => {
            //console.log('deleting onestaging', tx.id);
            await this.deletestaging(onestaging);
           });
        }
        else{
          await this.setstagingmissingtx(onestaging);
        }
      });
    }
    
  });

}



// Main function, intial call to update txs eventtypes thanks to stagings. Deletes stagings once tx updated or Updates stagings as missingtx if tx not found
async optimised_update_transfers_timestamp(){

  this.transfersnotimestamp().then(async (transfers) => {

    for (let onetransfer of transfers) {
    //console.log('updating timestamp of onetransfer', onetransfer.id);
    
    this.gettransfertx(onetransfer).then((tx) => {
        if (tx && tx != null){
          //console.log('onetransfer id is ', onetransfer.id);
          //console.log('tx of onetransfer is ', tx.hash);

          this.getblockfromtx(tx).then((block) => {

          this.updatettransfer_timestamp(onetransfer, block.timestamp).then((isinserted) => {

            // updates lasttransferiddone for optimised queries:s
             if(isinserted && this.lasttransfersiddone < onetransfer.id){
              this.lasttransfersiddone = onetransfer.id;
             }
             
             });

            });

        }
        else{
          this.getstagingtransfer(onetransfer).then((staging) => {

            if (!staging || staging == null){

              let newstaging = {
                hash: onetransfer.transactionhash,
                txmissing: 1,
                eventtype: null // eventtype is null for transfers
              };
           // console.log('onetransfer', onetransfer.id, 'has no staging yet');
            this.insertStaging(newstaging).then((isinserted) => {
             // console.log('inserted transfer timestamp staging', onetransfer.id);
             
              // updates lasttransferiddone for optimised queries:s
             if(isinserted && this.lasttransfersiddone < onetransfer.id){
              // console.log('this.lasttransfersiddone is now', this.lasttransfersiddone);
              this.lasttransfersiddone = onetransfer.id;
             }
             
             });

            }
            else {
             console.log('onetransfer', onetransfer.id, 'already has staging');
             this.lasttransfersiddone = onetransfer.id;
            }

          });
        }
      });
    }
  });

}




// --------- MAIN FUNCTIONS ---------- //



async optimisedupdatetransferstimestamp(){

    return new Promise(async (resolve, reject) => {
    await axios.get('https://www.eticascan.org/api/optimisedupdatetransferstimestamp')
      .then(resp => {
       // console.log(`statusCode: ${resp.status}`);
        //console.log(resp);
        resolve(resp);
        //console.log('optimisedupdatetransferstimestamp called success');
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });

    });

}



async updatequeryoptimizers(){

    return new Promise(async (resolve, reject) => {
    await axios.get('https://www.eticascan.org/api/updatequeryoptimizers')
      .then(resp => {
       // console.log(`statusCode: ${resp.status}`);
        //console.log(resp);
        resolve(resp);
       //console.log('updatequeryoptimizers called success');
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });

    });

}


// get staging's etransaction
  async getstagingtx(_staging) {

    var query_str =
        "SELECT * " +
        "FROM etransactions " +
        "WHERE id > ? " +   
        "AND (hash = ?) " +
        "LIMIT 1 ";
       
        //let max_serachid = _block_latestdb.id - 100; // search only on last 100 blocks    
        //console.log('_block_latestdb is', _block_latestdb);
        //console.log('max_searchid is', max_serachid);
        var query_var = [80000,_staging.hash];
        
  
    let _connection = this.connection;
   
    return new Promise(async (resolve, reject) => {
    // query the database
  var cnt = await _connection.query(query_str, query_var, (error, results) => {
    if(error){
        this.reconnectmysql();
        reject(error);
    }
        
        if (typeof results !== 'undefined'){
        if(results.length){
  // Success
  // tx is in DB
            resolve(results[0]);
        }
  
        else {
            // no tx found
            resolve(null);
        }
    }
  else {
    reject('error query did not return results');
  }
  
  
        
    });
  
  });
    
    }

// get transfer's staging:
    async getstagingtransfer(_transfer) {

      var query_str =
          "SELECT * " +
          "FROM stagingupdates " +
          "WHERE hash = ? " +
          "LIMIT 1 ";

          var query_var = [_transfer.transactionhash];
          
    
      let _connection = this.connection;
     
      return new Promise(async (resolve, reject) => {
      // query the database
    var cnt = await _connection.query(query_str, query_var, (error, results) => {
      if(error){
          this.reconnectmysql();
          reject(error);
      }
          
          if (typeof results !== 'undefined'){
          if(results.length){
    // Success
    // staging is in DB
              resolve(results[0]);
          }
    
          else {
              // no tx found
              resolve(null);
          }
      }
    else {
      reject('error query did not return results');
    }
    
    
          
      });
    
    });
      
      }


    async gettransfertx(_transfer) {

      var query_str =
          "SELECT * " +
          "FROM etransactions " +
          "WHERE id > ? " +   
          "AND (hash = ?) " +
          "LIMIT 1 ";

          var query_var = [20000,_transfer.transactionhash];
          
    
      let _connection = this.connection;
     
      return new Promise(async (resolve, reject) => {
      // query the database
    var cnt = await _connection.query(query_str, query_var, (error, results) => {
      if(error){
          this.reconnectmysql();
          reject(error);
      }
          
          if (typeof results !== 'undefined'){
          if(results.length){
    // Success
    // tx is in DB
              resolve(results[0]);
          }
    
          else {
              // no tx found
              resolve(null);
          }
      }
    else {
      reject('error query did not return results');
    }
    
    
          
      });
    
    });
      
      }


  async getstagings() {

      var query_str =
          "SELECT * " +
          "FROM stagingupdates ";
  
  
      let _connection = this.connection;
     
      return new Promise(async (resolve, reject) => {
      // query the database
      await _connection.query(query_str, (error, results) => {
          if(error){
              this.reconnectmysql();
              reject(error);
          }
          

          if (typeof results !== 'undefined'){
          if(results.length){
                 resolve(results);  
          }
  
          else {
              // no staging in db:
              let emptyresults = [];
              resolve(emptyresults);
          }
      }
  else {
      reject('error query did not return results');
  }
  
  
          
      });
  
  });
      
      }


      async getblockfromtx(_tx) {

        var query_str =
            "SELECT * " +
            "FROM blocks " +
            "WHERE id > ? " +   
            "AND (id = ?) " +
            "LIMIT 1 ";

            var query_var = [1000000,_tx.block_id];
            
    
        let _connection = this.connection;
       
        return new Promise(async (resolve, reject) => {
        // query the database
    var cnt = await _connection.query(query_str, query_var, (error, results) => {
        if(error){
            this.reconnectmysql();
            reject(error);
        }
            
            if (typeof results !== 'undefined'){
            if(results.length){
                
                // retrieve block from DB
                resolve(results[0]);
            }
    
            else {
                // error block is not found
                console.log('error block not found');
                resolve(null);
            }
        }
    else {
        reject('error query did not return results');
    }
    
    
            
        });
    
    });
        
        }




      // Will update amount of eticas transfered in tx with eticatransf amount (called when storing events in DB of type transfer): (txhash is etransaction hash)
      async updatetx(_tx, _staging) {
    
        let txhash = _tx.hash;
        let _eventtype = _staging.eventtype;
    let txsql = [{'eventtype': _eventtype}, txhash];
    
    let _connection = this.connection;
    return new Promise(async (resolve, reject) => {
    // IUpdate the database, use LIMIT 1 to avoid it keep looking for other records once found the single one that should be updated:
    _connection.query('UPDATE etransactions SET ? WHERE hash = ?', txsql, (error, results) => {
        //if(error) reject(error);
        if(error){
            this.reconnectmysql();
            reject(error);
        }
        
        // Success
      //  console.log('New tx eticatransf updated DB', txhash);
        //console.log(results);
        // now let's notify the clients
        // io.emit('block_processed', block);
        resolve(results);
        });
    });

    }


    async updatettransfer_timestamp(transfer, timestamp) {
    
  let transferid = transfer.id;

  let transfersql = [{'timestamp': timestamp}, transferid];
  
  let _connection = this.connection;
  return new Promise(async (resolve, reject) => {
  // IUpdate the database, use LIMIT 1 to avoid it keep looking for other records once found the single one that should be updated:
  _connection.query('UPDATE transfers SET ? WHERE id = ?', transfersql, (error, results) => {
      //if(error) reject(error);
      if(error){
          this.reconnectmysql();
          reject(error);
      }
      
     // console.log('update tarnsfers resultq is', results);
      // Success
      if(results.affectedRows >= 1){
        resolve(true);
      }
      else {
        reject(false);
      }
      

      });
  });

  }


// tx is missing for this staging:
    async setstagingmissingtx(_staging) {
    
  let staginghash = _staging.hash;
  let stagingsql = [{'txmissing': 1}, staginghash];
  
  let _connection = this.connection;
  return new Promise(async (resolve, reject) => {
  // IUpdate the database, use LIMIT 1 to avoid it keep looking for other records once found the single one that should be updated:
  _connection.query('UPDATE stagingupdates SET ? WHERE hash = ?', stagingsql, (error, results) => {
      //if(error) reject(error);
      if(error){
          this.reconnectmysql();
          reject(error);
      }
      
      // Success
      // console.log('_staging updated DB as missing tx', _staging.hash);
      resolve(results);
      });
  });

  }




    async deletestaging(_staging) {

      var query_str =
          "DELETE " +
          "FROM stagingupdates " +
          "WHERE hash = ? " +
          "LIMIT 1 ";
         
          //let max_serachid = _block_latestdb.id - 100; // search only on last 100 blocks    
          //console.log('_block_latestdb is', _block_latestdb);
          //console.log('max_searchid is', max_serachid);
          var query_var = [_staging.hash];
          console.log('deleting _staging', _staging.hash);
    
      let _connection = this.connection;
     
      return new Promise(async (resolve, reject) => {
      // query the database
    var cnt = await _connection.query(query_str, query_var, (error, results) => {
      if(error){
          this.reconnectmysql();
          reject(error);
      }
          resolve(true);   
      });
    
    });
      
      }


      async transfersnotimestamp() {

            var query_str =
            "SELECT * " +
            "FROM transfers " +
            "WHERE id >= ? " +
            "AND id < ? " +   
            "AND ((timestamp = 0) OR (timestamp IS NULL)) ";

            console.log('this.lasttransfersiddone is', this.lasttransfersiddone);
            let max_rows = 50;
            var query_var = [this.lasttransfersiddone, this.lasttransfersiddone + max_rows ];
            //this.lasttransfersiddone = this.lasttransfersiddone +max_rows;
    
        let _connection = this.connection;
       
        return new Promise(async (resolve, reject) => {
        // query the database
        await _connection.query(query_str, query_var, (error, results) => {
            if(error){
                this.reconnectmysql();
                reject(error);
            }
            
  
            if (typeof results !== 'undefined'){
            if(results.length){
                   resolve(results);  
            }
    
            else {
                // no staging in db:
                let emptyresults = [];
                resolve(emptyresults);
            }
        }
    else {
        reject('error query did not return results');
    }
    
    
            
        });
    
    });
        
        }

        async insertStaging(_newstaging) {
    
          let sqlnewstaging = {
               eventtype: _newstaging.eventtype,
               hash: _newstaging.hash,
               txmissing: _newstaging.txmissing
              };

          
          let _connection = this.connection;
          return new Promise(async (resolve, reject) => {
          _connection.query('INSERT INTO stagingupdates SET ?', sqlnewstaging, (error, results) => {
              //if(error) reject(error);
              if(error){
                  this.reconnectmysql();
                  reject(error);
              }
              
              // Success
             // console.log('new staging inserted is', _newstaging.hash);
             // console.log('new staging inserted result is', results);
              
              if(results.insertId > 0){
                resolve(true);  
             }
             else {
                reject(error);
             }

              });
          });
      
          }

}

let newHanlder = new CronsHandler(198597);

newHanlder.updatesatgings();

/*
setInterval(() => {
    newHanlder.updatesatgings();
}, 60 * 1000); */ // every 20 seconds 

/*
setInterval(() => {
  newHanlder.updatesatgings();
}, 15 * 1000); // every 20 seconds */

  


/*
setInterval(() => {
    newHanlder.optimisedupdatetransferstimestamp();
}, 20 * 1000); // every 20 seconds

setInterval(() => {
    newHanlder.updatequeryoptimizers();
}, 600 * 1000); // every 30 seconds  */