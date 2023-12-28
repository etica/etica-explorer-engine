## ETICA EXPLORER ENGINE SCRIPTS

### SCRIPTS TO RUN

Run the following commands:

```bash
-> node SynchronizeBlocks.js 
-> node SynchronizeMissedTxs.js 
-> node SynchronizeTxsFailures.js
-> node EticascanFillTables.js 
-> node EticascanMysqlCrons.js 
```

launch an rpc api endpoint returning blockchain metric data (optional):
-> node api-server.js

## LAUNCH knex migrations:
```bash
-> npx knex migrate
```

Once the scripts are launched, your database will be synced and continuously update with the latest blockchain data. This database is versatile and can be employed to develop new web applications or seamlessly integrate Etica data into your existing web apps.

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