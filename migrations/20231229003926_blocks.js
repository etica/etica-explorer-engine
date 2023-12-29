exports.up = function(knex) {
    return knex.schema.createTable('blocks', function(table) {
      table.increments('id').primary();
      table.integer('number').nullable().index(); // The block number. null if a pending block. stored as integer to facilitate sorting
      table.string('hash').nullable(); // Hash of the block. null if a pending block.
      table.string('parenthash').nullable(); // String: Hash of the parent block.
      table.string('nonce').nullable(); // 8 Bytes - String: Hash of the generated proof-of-work. null if a pending block.
      table.string('sha3Uncles'); // String: SHA3 of the uncles data in the block.
      table.text('logsBloom'); // String: The bloom filter for the logs of the block. null if a pending block.
      table.string('transactionsRoot'); // String: The root of the transaction trie of the block.
      table.string('stateRoot'); // String: The root of the final state trie of the block.
      table.string('miner'); // String: The address of the beneficiary to whom the mining rewards were given.
      table.string('difficulty'); // String: Integer of the difficulty for this block.
      table.string('totalDifficulty'); // String: Integer of the total difficulty of the chain until this block.
      table.string('extraData'); // String: Integer of the total difficulty of the chain until this block.
      table.integer('size'); // Number: Integer the size of this block in bytes.
      table.integer('gasLimit'); // Number: The maximum gas allowed in this block.
      table.integer('gasUsed'); // Number: The total used gas by all transactions in this block.
      table.integer('timestamp'); // Number: The unix timestamp for when the block was collated.
      table.integer('nbtxs').nullable();
      
      table.index('timestamp');
      table.index('number');
      table.index('hash');
      table.index('parenthash');
      table.index('miner');
  
      table.timestamps(false, true); // will need to remove created_at and updated_at from sql queries to match web3 returned objects
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('blocks');
  };