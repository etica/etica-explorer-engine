exports.up = function(knex) {
    return knex.schema.table('newreveals', function(table) {
        table.renameColumn('proposal', 'proposal_hash');
        table.index('proposal_hash');
      });
};


exports.down = function(knex) {
    return knex.schema.table('newreveals', function(table) {
        table.renameColumn('proposal_hash', 'proposal');
      });
};
