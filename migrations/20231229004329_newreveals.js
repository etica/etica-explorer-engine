exports.up = function(knex) {
    return knex.schema.createTable('newreveals', function(table) {
      table.increments('id').primary();
      table.string('transactionhash'); // Hash of the transaction
      table.string('voter'); // Address of the proposer
      table.string('proposal'); // Hash of the proposal
      table.string('amount'); // Amount of the vote

      table.index('transactionhash');
      table.index('voter');
      table.index('proposal');

    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('newreveals');
  };