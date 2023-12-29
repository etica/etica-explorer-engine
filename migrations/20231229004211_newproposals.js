exports.up = function(knex) {
    return knex.schema.createTable('newproposals', function(table) {
      table.increments('id').primary();
      table.string('transactionhash'); // Hash of the transaction
      table.string('proposed_release_hash'); // Hash of the proposal
      table.string('proposer'); // Address of the proposer
      table.string('diseasehash'); // Disease hash
      table.string('chunkid'); // Blockchain Id of the chunk
      table.string('periodid').nullable();
      table.string('title').nullable();
      table.text('description').nullable();
      table.text('freefield').nullable();
      table.string('raw_release_hash').nullable();

      table.index('transactionhash');
      table.index('proposed_release_hash');
      table.index('proposer');
      table.index('diseasehash');
      table.index('raw_release_hash');
      table.index('chunkid');
      table.index('periodid');

    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('newproposals');
  };