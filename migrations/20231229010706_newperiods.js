exports.up = function(knex) {
    return knex.schema.createTable('newperiods', function(table) {
      table.increments('id').primary();
      table.string('transactionhash');
      table.integer('periodid').unique();
      table.integer('interval').nullable();
      table.string('curation_sum').nullable();
      table.string('editor_sum').nullable();
      table.string('reward_for_editor').nullable();
      table.string('reward_for_curation').nullable();
      table.string('forprops').nullable();
      table.string('againstprops').nullable();
      table.timestamps(true, true);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('newperiods');
  };