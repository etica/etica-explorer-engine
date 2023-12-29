exports.up = function(knex) {
    return knex.schema.createTable('newstakesnaps', function(table) {
      table.increments('id').primary();
      table.string('staker');
      table.string('snapamount');

      table.index('staker');

    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('newstakesnaps');
  };