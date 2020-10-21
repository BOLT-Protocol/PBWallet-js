const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const bip32 = require('bip32');

const network = {
  BITCOIN_MAINNET: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'bc',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
  },
  BITCOIN_REGTEST: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'bcrt',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
  },
  BITCOIN_TESTNET: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
  },
  LITECOIN_TEST: {
    messagePrefix: '\x19Litecoin Testnet Signed Message:\n',
    bech32: 'ltc',
    bip32: {
      public: 0x0436EF7D,
      private: 0x0436F6E1,
    },
    pubKeyHash: 0x6F,
    scriptHash: 0xEF,
    wif: 0xC4,
  },
  LITECOIN_MAIN: {
    messagePrefix: '\x19Litecoin Mainnet Signed Message:\n',
    bech32: 'ltc',
    bip32: {
      public: 0x019da462,
      private: 0x019d9cfe,
    },
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0,
  },
  DOGE_TEST: {
    messagePrefix: '\x19Dogecoin Testnet Signed Message:\n',
    bech32: 'doge',
    bip32: {
      public: 0x0432a243,
      private: 0x0432a9a8,
    },
    pubKeyHash: 0x71,
    scriptHash: 0xF1,
    wif: 0xC4,
  },
  DOGE_MAIN: {
    messagePrefix: '\x19Dogecoin Mainnet Signed Message:\n',
    bech32: 'doge',
    bip32: {
      public: 0x02facafd,
      private: 0x02fac398,
    },
    pubKeyHash: 0x1e,
    scriptHash: 0x16,
    wif: 0x9e,
  },
  DASH_TEST: {
    messagePrefix: '\x19Dashcoin Testnet Signed Message:\n',
    bech32: 'dash',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x8c,
    scriptHash: 0x13,
    wif: 0xef,
    dustThreshold: 5460,
  },
  DASH_MAIN: {
    messagePrefix: '\x19Dashcoin Mainnet Signed Message:\n',
    bech32: 'dash',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x4c,
    scriptHash: 0x10,
    wif: 0xcc,
    dustThreshold: 5460,
  },
  BCH_TEST: {
    messagePrefix: '\x19Bitcoin Cash Testnet Signed Message:\n',
    bech32: 'bch',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
  },
  BCH_MAIN: {
    messagePrefix: '\x19Bitcoin Cash Mainnet Signed Message:\n',
    bech32: 'bch',
    bip32: {
      public: 0x0488B21E,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
  },
};

class HDWallet {
  constructor(mnemonic, passphrase, currencyType, testnet = false, lang = 'english') {
    this._mnemonic = mnemonic;
    this._passphrase = passphrase;
    this._currencyType = currencyType;
    this._testnet = testnet;
    this._lang = lang;
    this.hdWallet = null;
    this._network = this.getNetwork(currencyType, testnet);
    this.WORDLISTS = [
      'chinese_simplified',
      'chinese_traditional',
      'english',
      'french',
      'italian',
      'japanese',
      'spanish',
      'korean',
    ];
    bip39.setDefaultWordlist(this._lang);
  }

  async createMnemonic() {
    this._mnemonic = bip39.generateMnemonic();
    return this._mnemonic;
  }

  validateMnemonic(mnemonic) {
    let result = false;
    Object.keys(bip39.wordlists).forEach((word) => {
      if (bip39.validateMnemonic(mnemonic, bip39.wordlists[word])) result = true;
    });
    return result;
  }

  getNetwork(currencyType) {
    let cryptoNetwork = this._testnet ? network.BITCOIN_TESTNET : network.BITCOIN_MAINNET;
    if (currencyType === 2) cryptoNetwork = this._testnet ? network.LITECOIN_TEST : network.LITECOIN_MAIN;
    if (currencyType === 3) cryptoNetwork = this._testnet ? network.DOGE_TEST : network.DOGE_MAIN;
    if (currencyType === 5) cryptoNetwork = this._testnet ? network.DASH_TEST : network.DASH_MAIN;
    if (currencyType === 145) cryptoNetwork = this._testnet ? network.BCH_TEST : network.BCH_MAIN;

    return cryptoNetwork;
  }

  async createHDWallet() {
    if (!this._mnemonic) this._mnemonic = await this.createMnemonic();
    return new Promise((resolve, reject) => {
      if (!this.validateMnemonic(this._mnemonic)) {
        reject(new Error('mnemonic is invalid'));
        return;
      }

      try {
        this.mnemonicToSeed(this._mnemonic, this._passphrase).then((seed) => {
          this.hdWallet = bip32.fromSeed(seed, this._network);
          resolve(this);
        });
      } catch (e) {
        reject(new Error(`Create HDWallet Error: ${e}`));
      }
    });
  }

  mnemonicToSeed(mnemonic, parse = this.parse) {
    return new Promise((resolve, reject) => {
      try {
        bip39.mnemonicToSeed(mnemonic, parse)
          .then((seed) => {
            this.seed = seed;
            resolve(seed);
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  getAccount(change, index) {
    const baseNode = this.hdWallet.derivePath(`m/84'/3324'/0'/${change}'/${index}'`);
    const { address } = bitcoin.payments.p2pkh({ pubkey: baseNode.publicKey, network: this._network });
    return address;
  }
}

let hdWalletInstance;
const newInstance = (mnemonic, passphrase, currencyType, testnet, lang) => {
  if (typeof hdWalletInstance === 'object') {
    return hdWalletInstance;
  }

  hdWalletInstance = new HDWallet(mnemonic, passphrase, currencyType, testnet, lang);
  return hdWalletInstance.createHDWallet();
};

module.exports = newInstance;
