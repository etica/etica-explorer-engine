exports.up = function(knex) {
    return knex.schema.createTable('newcommits', function(table) {
      table.increments('id').primary();
      table.string('transactionhash'); // Hash of the transaction
      table.string('voter'); // Address of the voter
      table.string('votehash'); // Hash of the vote
      table.string('amount'); // Amount

      table.index('transactionhash');
      table.index('voter');
      table.index('votehash');

    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('newcommits');
  };