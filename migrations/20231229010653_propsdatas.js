exports.up = function(knex) {
    return knex.schema.createTable('propsdatas', function(table) {
      table.increments('id').primary();
      table.integer('newproposal_id').nullable(); // database id of proposal
      table.string('proposalhash').unique(); // also store proposalhash just in case, will be easier to rebuild data
      table.string('starttime').nullable();
      table.string('endtime').nullable(); 
      table.string('finalized_time').nullable(); // need update process to fill only once proposal passed pending
      table.string('status').nullable(); // need update process to fill only once proposal passed pending
      table.string('prestatus').nullable(); // need update process to fill only once proposal passed pending
      table.string('istie').nullable(); // need update process to fill only once proposal passed pending
      table.string('nbvoters').nullable(); // need update process to fill only once proposal passed pending
      table.string('slashingratio').nullable(); // need update process to fill only once proposal passed pending
      table.string('forvotes').nullable(); // need update process to fill only once proposal passed pending
      table.string('againstvotes').nullable(); // need update process to fill only once proposal passed pending
      table.string('lastcuration_weight').nullable(); // unnecessary
      table.string('lasteditor_weight').nullable(); // unnecessary
      table.string('approvalthreshold').nullable();

      table.index('proposalhash');

    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('propsdatas');
  };