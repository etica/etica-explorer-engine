exports.up = function(knex) {
    return knex.schema.createTable('newstakescsldts', function(table) {
      table.increments('id').primary();
      table.string('staker');
      table.string('endtime');
      table.string('minlimit');

      table.index('staker');

    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('newstakescsldts');
  };