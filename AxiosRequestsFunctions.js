const axios = require('axios');
let mysql = require('mysql');

var moment = require('moment');  

// Script to send post queries to other servers

class AxiosHandler {

    connection;
    contract;
    web3;

    constructor() {

      console.log('axioshandler started with success');

    }


// --------- MAIN FUNCTIONS ---------- //
    async getcall(url){

        return new Promise(async (resolve, reject) => {
        await axios.get(url)
          .then(resp => {
            resolve('ok');
          })
          .catch(error => {
            console.log('getcall error: ', error);
            reject(error.error);
          });
    
        });

    }

    async postcall(url, jsondata){

        return new Promise(async (resolve, reject) => {
        await axios.post(url, jsondata)
          .then(resp => {
              resolve('ok');
          })
          .catch(error => {
            console.log('postcall error: ', error);
            reject(error.error);
          });
    
        });

    }

}

let newwaxiosHanlder = new AxiosHandler();
module.exports = AxiosHandler; // Export class