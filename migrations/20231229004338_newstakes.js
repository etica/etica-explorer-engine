exports.up = function(knex) {
    return knex.schema.createTable('newstakes', function(table) {
      table.increments('id').primary();
      table.string('transactionhash'); // Hash of the transaction
      table.string('staker'); // Address of the staker
      table.string('amount'); // Amount of the stake

      table.index('transactionhash');
      table.index('staker');

    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('newstakes');
  };