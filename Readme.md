## ETICA EXPLORER ENGINE



### 1. **Install Etica Explorer Engine**

**Install Etica Explorer Engine with following commands**:
```
mkdir etica-explorer-engine
cd etica-explorer-engine
git clone https://github.com/etica/etica-explorer-engine.git
npm install
```

### 2. Install PM2 (or any other Process Manager)

For managing the execution of etica-explorer-engine scripts, we recommend using PM2, a production process manager. If you haven't already installed a process manager like PM2, follow these steps:

**Install PM2 globally**:
```
npm install pm2 -g
```

### 3. LAUNCH knex migrations:

1.Make sure to create a database named eticaenginedb with MYSQL, PpostgreSQL or any of the one in the supported list bellow
2.Then update .env to set the database connection settings.
3.Finally launch migrations:

```bash
npx knex migrate:latest
```
knex migrations full documentation: https://knexjs.org/guide/migrations.html#migration-cli

### 4. SCRIPTS TO RUN

**Start Etica Explorer Engine**: Run the following command in your terminal or command prompt:

```bash
pm2 start SynchronizeBlocks.js 
pm2 start SynchronizeMissedTxs.js 
pm2 start SynchronizeTxsFailures.js
pm2 start DataTablesEngine.js 
pm2 start OptimisersCrons.js 
```

(optional) Launch an rpc api endpoint returning blockchain metric data:
```bash
pm2 start api-server.js
```


Once the scripts are launched you will have a synced database that will keep syncing with blockchain data.

The database can be used to build brand new web apps or integrate Etica data into your existing web apps

## Supported Databases

Etica Explorer Engine relies on the knex.js ORM to interact with databases. As a result, Etica Engine Explorer supports various databases, including:
- PostgreSQL
- CockroachDB
- MSSQL
- MySQL
- MariaDB
- SQLite3
- Better-SQLite3
- Oracle
- Amazon Redshift