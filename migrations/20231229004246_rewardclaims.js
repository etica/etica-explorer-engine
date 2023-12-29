exports.up = function(knex) {
    return knex.schema.createTable('rewardclaims', function(table) {
      table.increments('id').primary();
      table.string('transactionhash'); // Hash of the transaction
      table.string('voter'); // Address of voter
      table.string('proposal_hash'); // Proposal hash
      table.string('amount'); // Vote amount in Bosoms

      table.index('transactionhash');
      table.index('voter');
      table.index('proposal_hash');

    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('rewardclaims');
  };