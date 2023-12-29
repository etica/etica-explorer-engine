exports.up = function(knex) {
    return knex.schema.createTable('queryoptimizers', function(table) {
      table.increments('id').primary();
      table.integer('lastblockdbid').nullable();
      table.integer('lasttxdbid').nullable();
      table.integer('lasttransferdbid').nullable();
      table.timestamps(true, true);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('queryoptimizers');
  };