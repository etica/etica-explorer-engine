require('dotenv').config();

const clients = {
  mysql: {
    client: 'mysql',
    connection: {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT,
    },
    pool: { min: 2, max: 7 }
  },
  pg: {
    client: 'pg',
    connection: {
      host: process.env.PGSQL_HOST,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      port: process.env.PG_PORT,
    },
    pool: { min: 2, max: 7 }
  }
};

const selectedClient = process.env.DBTYPE;

if (!selectedClient || !clients[selectedClient]) {
  console.log('DBTYPE config missing in .env or invalid. Please enter a valid DBTYPE (mysql, pg, ...)');
  process.exit(1);
}

module.exports = {
  ...clients[selectedClient]
};