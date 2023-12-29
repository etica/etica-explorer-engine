exports.up = function(knex) {
    return knex.schema.createTable('stagingupdates', function(table) {
      table.increments('id').primary();
      table.string('hash'); // Hash of the transaction to update
      table.integer('eventtype').nullable(); // Eventtype to update tx with
      table.boolean('txmissing').defaultTo(false); // By default, tx is not missing; will be set to true if tx is not found in the database
      table.timestamps(true, true);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('stagingupdates');
  };