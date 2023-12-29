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
    pool: { min: 2, max: 10 }
  },
  mysql2: {
    client: 'mysql2',
    connection: {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT,
    },
    pool: { min: 2, max: 10 }
  },
  pg: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      port: process.env.PG_PORT,
    },
    pool: { min: 2, max: 10 }
  },
  sqlite3: {
    client: 'sqlite3',
    connection: {
      filename: process.env.SQLITE3_FILENAME,
      flags: process.env.SQLITE3_FLAGS
    },
    pool: { min: 2, max: 10 }
  }
};

const selectedClient = process.env.DB_CLIENT_TYPE;

if (!selectedClient || !clients[selectedClient]) {
  console.log('DB_CLIENT_TYPE config missing in .env or invalid. Please enter a valid DB_CLIENT_TYPE (mysql, pg, ...)');
  process.exit(1);
}

module.exports = {
  ...clients[selectedClient]
};