const PBWallet = require('./lib/PBWallet.js');

PBWallet.Initialize()
  .then(async (item) => {
    item.dbController.insert('hdw', {
      id: 'test',
      user_id: 'test',
      passphrase_hash: 'test',
      passphrase_salt: 'test',
      wallet_name: 'test',
      mnemonic: 'test',
      seed: 'test',
    });
  });
