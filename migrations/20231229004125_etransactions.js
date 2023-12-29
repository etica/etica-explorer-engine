exports.up = function(knex) {
    return knex.schema.createTable('etransactions', function(table) {
      table.increments('id').primary();
      table.integer('block_id').nullable(); // will need to remove block_id from sql queries to match web3 returned objects
      table.string('hash').nullable(); // String: Hash of the transaction.
      table.string('nonce'); // Number: The number of transactions made by the sender prior to this one.
      table.string('blockHash').nullable(); // String: Hash of the block where this transaction was in. null if pending.
      table.integer('blockNumber').nullable().index(); // Number: Block number where this transaction was in. null if pending.
      table.string('transactionIndex').nullable(); // Number: Integer of the transactions index position in the block. null if pending.
      table.string('from'); // String: Address of the sender.
      table.string('to').nullable(); // String: Address of the receiver. null if it’s a contract creation transaction.
      table.string('value'); // String: Value transferred in wei.
      table.integer('gas'); // Number: Gas provided by the sender.
      table.string('gasPrice'); // String: Gas price provided by the sender in wei.
      table.text('input'); // String: The data sent along with the transaction.
      table.integer('eventtype').nullable(); 
      table.string('eticatransf').nullable(); 
      table.boolean('status').defaultTo(true);

      table.index('block_id');
      table.index('hash');
      table.index('blockHash');
      table.index('from');
      table.index('to');
  
      table.timestamps(false, true); // will need to remove created_at and updated_at from sql queries to match web3 returned objects
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('etransactions');
  };