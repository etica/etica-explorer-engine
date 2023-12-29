exports.up = function(knex) {
    return knex.schema.createTable('newchunks', function(table) {
      table.increments('id').primary();
      table.string('transactionhash'); // Hash of the transaction
      table.string('chunkid'); // Blockchain Id of the chunk
      table.string('diseasehash'); // Disease hash
      table.string('title').nullable();
      table.text('desc').nullable();
      table.string('idx').nullable();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('newchunks');
  };