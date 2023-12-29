exports.up = function(knex) {
    return knex.schema.createTable('tieclaims', function(table) {
      table.increments('id').primary();
      table.string('transactionhash');
      table.string('voter');
      table.string('proposal_hash');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('tieclaims');
  };