## ETICA EXPLORER ENGINE SCRIPTS



### 1. **Install Etica Explorer Engine**

1. **Install Etica Explorer Engine**:
    ```
    mkdir etica-explorer-engine
    cd etica-explorer-engine
    git clone https://github.com/etica/etica-explorer-engine.git
    npm install
    ```

### 2. Install PM2 (or any other Process Manager)

For managing the execution of Node.js applications and scripts, we recommend using PM2, a production process manager. If you haven't installed PM2 already, follow these steps:

2. **Install PM2 globally**: Run the following command in your terminal or command prompt:
    ```
    npm install pm2 -g
    ```

### 3. LAUNCH knex migrations:
```bash
-> npx knex migrate
```


### 4. SCRIPTS TO RUN

Run the following commands:

```bash
-> pm2 start SynchronizeBlocks.js 
-> pm2 start SynchronizeMissedTxs.js 
-> pm2 start SynchronizeTxsFailures.js
-> pm2 start EticascanFillTables.js 
-> pm2 start EticascanMysqlCrons.js 
```

launch an rpc api endpoint returning blockchain metric data (optional):
```bash
-> node api-server.js
```


Once the scripts are launched you will have a synced database that will keep syncing with blockchain data.

The database can be used to build brand new web apps or integrate Etica data into your existing web apps

## Supported Databases

Etica Explorer Engine relies on the powerful knex.js ORM to interact with databases. As a result, Etica Engine Explorer supports various databases, including:
- PostgreSQL
- CockroachDB
- MSSQL
- MySQL
- MariaDB
- SQLite3
- Better-SQLite3
- Oracle
- Amazon Redshift