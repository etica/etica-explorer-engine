exports.up = function(knex) {
    return knex.schema.createTable('newslashs', function(table) {
      table.increments('id').primary();
      table.string('transactionhash'); // Hash of the transaction
      table.string('voter'); // Address of the voter
      table.string('amount'); // Slash amount
      table.string('proposal_hash'); // Hash of the proposal
      table.string('duration'); // Slash duration

      table.index('transactionhash');
      table.index('voter');
      table.index('proposal_hash');

    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('newslashs');
  };