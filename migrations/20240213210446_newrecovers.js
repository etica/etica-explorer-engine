exports.up = function(knex) {
    return knex.schema.createTable('newrecovers', function(table) {
      table.increments('id').primary();
      table.string('transactionhash'); // Hash of the transaction
      table.string('voter'); // Address of the proposer
      table.string('proposal_hash'); // Hash of the proposal
      table.string('amount'); // Amount of the vote

      table.index('transactionhash');
      table.index('voter');
      table.index('proposal_hash');

    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('newrecovers');
  };