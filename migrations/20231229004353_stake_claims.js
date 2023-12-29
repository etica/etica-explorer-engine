exports.up = function(knex) {
    return knex.schema.createTable('stakeclaims', function(table) {
      table.increments('id').primary();
      table.string('transactionhash'); // Hash of the transaction
      table.string('staker'); // Address of the staker
      table.string('stakeamount'); // Amount of the Stake
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('stakeclaims');
  };