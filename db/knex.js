const dotenv = require('dotenv');
dotenv.config();
const DBTYPE = process.env.DBTYPE;
if(!DBTYPE){
    console.log('DBTYPE config missing in .env. Please enter DBTYPE (mysql, pg ...)')
    return;
}
const config = require('../knexfile.js')[DBTYPE];
module.exports = require('knex')(config);