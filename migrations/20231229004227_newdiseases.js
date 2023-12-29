exports.up = function(knex) {
    return knex.schema.createTable('newdiseases', function(table) {
      table.increments('id').primary();
      table.string('transactionhash'); // Hash of the transaction
      table.string('diseaseindex'); // Disease index
      table.string('title'); // Blockchain title
      table.string('diseasehash').nullable();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('newdiseases');
  };