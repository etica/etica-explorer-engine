exports.up = function(knex) {
    return knex.schema.createTable('transfers', function(table) {
      table.increments('id').primary();
      table.string('transactionhash'); // Hash of the transaction
      table.string('from'); // Address of the sender
      table.string('to'); // Address of the receiver
      table.string('amount'); // Amount of the Transfer
      table.integer('timestamp').nullable();
      table.index('timestamp');

      table.index('transactionhash');
      table.index('from');
      table.index('to');

    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('transfers');
  };