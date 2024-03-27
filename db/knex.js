const dotenv = require('dotenv');
dotenv.config();
const DB_CLIENT_TYPE = process.env.DB_CLIENT_TYPE;
if(!DB_CLIENT_TYPE){
    console.log('DB_CLIENT_TYPE config missing in .env. Please enter DB_CLIENT_TYPE (mysql, pg ...)')
    return;
}
const config = require('./knexfile.js')[DB_CLIENT_TYPE];
const knex = require('knex')(config);

const { attachPaginate } = require('knex-paginate');
attachPaginate();

module.exports = knex;