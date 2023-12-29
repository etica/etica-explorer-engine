exports.up = function(knex) {
    return knex.schema.createTable('mints', function(table) {
      table.increments('id').primary();
      table.string('transactionhash'); // Hash of the transaction
      table.string('from'); // Address of the sender
      table.string('blockreward'); // Amount of the Transfer
      table.string('epochCount'); // Epoch Count
      table.string('newChallengeNumber'); // Challenge number

      table.index('transactionhash');
      table.index('from');

    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('mints');
  };