const wallet = require('ethereumjs-wallet');
const bitcoin = require('bitcoinjs-lib');
const bchaddr = require('bchaddrjs');
const base58 = require('bs58');
const { compressedPublicKey } = require('./utils');

/**
 * @classdesc PBWallet ExtendedKey
 */
class ExtendedKey {
  /**
   * @param {String} chainCode - the chain code
   * @param {String} parentFP - the parent fingerprint
   * @param {String} pubKey
   * @param {number} PBCryptocurrencyType.type
   * @param {boolean} testnet - is testnet?
   * @param {Object} logger - logger instance
   */
  constructor({
    chainCode,
    parentFP,
    pubKey,
    currencyType,
    testnet,
    logger,
  }) {
    this.chainIndex = 0;
    this.keyIndex = 0;
    this.chainCode = chainCode;
    this.parentFP = parentFP;
    this.pubKey = pubKey;
    this.currencyType = currencyType;
    this.testnet = testnet;
    this.address = '';
    this._logger = logger;
  }

  /** depth - get path length */
  get depth() {
    if (this.chainIndex != null && this.keyIndex != null) {
      return 5;
    } if (this.chainIndex != null && this.keyIndex == null) {
      return 4;
    } if (this.chainIndex == null && this.keyIndex == null) {
      return 3;
    }

    this.chainIndex = 0;
    return 4;
  }

  /**
   * get ETH publicKey
   * @return eth publicKey
   */
  driveUncompressedPubkey() {
    return wallet.fromPublicKey(this.pubKey).getPublicKey();
  }

  /**
   * ExtendedKey
   * CompressedPubkey
   * .pubKey length is 33
   * with prefix [0x02] | [0x03]
   * @param {number} chainIndex - the change index
   * @param {number} keyIndex - the key index
   * @return eth compressed publicKey
   */
  driveCompressedPubkey(chainIndex, keyIndex) {
    const _pubKey = (typeof this.pubKey === 'string') ? this.pubKey : this.pubKey.toString('hex');
    const _chainCode = (typeof this.chainCode === 'string') ? this.chainCode : this.chainCode.toString('hex');
    const _parentFP = (typeof this.parentFP === 'string') ? this.parentFP : this.parentFP.toString('hex');
    const { publicKey } = this.getCryptoAddress(_pubKey, _chainCode, _parentFP, this.testnet, this.currencyType, { depth: 5, index: keyIndex, change: chainIndex });
    return publicKey;
  }

  /**
   * @param {string} type - pub || prv
   * @param {boolean} testnet - is testnet?
   * @param {number} depth - the depth
   * @param {string} parentFP - the parent fingerprint
   * @param {number} index - the key index
   * @param {string} chainCode - the chain code
   * @param {string} compressedKey - the compressed key
      see: https://learnmeabitcoin.com/guide/extended-keys
  */
  serializedFormat({
    type = 'pub', testnet = false, depth = 3, parentFP, index = 0, chainCode, compressedKey,
  }) {
    const MAINNET_PUB = '0488B21E';
    const MAINNET_PRV = '0488ADE4';
    const TESTNET_PUB = '043587CF';
    const TESTNET_PRV = '04358394';

    // eslint-disable-next-line no-nested-ternary
    const version = testnet
      ? (type === 'pub' ? TESTNET_PUB : TESTNET_PRV)
      : (type === 'pub' ? MAINNET_PUB : MAINNET_PRV);
    const _depth = depth.toString(16).padStart(2, '0');
    const _index = index.toString(16).padStart(8, '0');

    const serialization = version + _depth + parentFP + _index + chainCode + compressedKey;
    const check = this.checksum(serialization);

    return base58.encode(Buffer.from(serialization + check, 'hex'));
  }

  /**
   * getCryptoAddress
   * @param {string} publicKey
   * @param {string} chainCode - The chain code
   * @param {number} parentFP - the parent fingerprint
   * @param {boolean} testnet - is testnet?
   * @param {number} PBCryptocurrencyType.type
   * @param {number} depth - the depth
   * @param {number} index - the key index
   * @param {number} change - the change index
   * @return {Object} { address, publicKey }
   */
  getCryptoAddress(publicKey, chainCode, parentFP, testnet = false, currencyType, depth = 3, index = 0, change = 0) {
    const CPK = compressedPublicKey(Buffer.from(publicKey, 'hex'));
    const SF = this.serializedFormat({
      parentFP,
      chainCode,
      compressedKey: CPK,
      testnet,
    });

    const LITECOIN_TEST = {
      messagePrefix: '\x19Litecoin Testnet Signed Message:\n',
      bech32: 'ltc',
      bip32: {
        public: 0x0436EF7D,
        private: 0x0436F6E1,
      },
      pubKeyHash: 0x6F,
      scriptHash: 0xEF,
      wif: 0xC4,
    };

    const LITECOIN_MAIN = {
      messagePrefix: '\x19Litecoin Mainnet Signed Message:\n',
      bech32: 'ltc',
      bip32: {
        public: 0x019da462,
        private: 0x019d9cfe,
      },
      pubKeyHash: 0x30,
      scriptHash: 0x32,
      wif: 0xb0,
    };

    const DOGE_TEST = {
      messagePrefix: '\x19Dogecoin Testnet Signed Message:\n',
      bech32: 'doge',
      bip32: {
        public: 0x0432a243,
        private: 0x0432a9a8,
      },
      pubKeyHash: 0x71,
      scriptHash: 0xF1,
      wif: 0xC4,
    };

    const DOGE_MAIN = {
      messagePrefix: '\x19Dogecoin Mainnet Signed Message:\n',
      bech32: 'doge',
      bip32: {
        public: 0x02facafd,
        private: 0x02fac398,
      },
      pubKeyHash: 0x1e,
      scriptHash: 0x16,
      wif: 0x9e,
    };

    const DASH_TEST = {
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
    };

    const DASH_MAIN = {
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
    };

    const BCH_TEST = {
      messagePrefix: '\x19Bitcoin Cash Testnet Signed Message:\n',
      bech32: 'bch',
      bip32: {
        public: 0x043587cf,
        private: 0x04358394,
      },
      pubKeyHash: 0x6f,
      scriptHash: 0xc4,
      wif: 0xef,
    };

    const BCH_MAIN = {
      messagePrefix: '\x19Bitcoin Cash Mainnet Signed Message:\n',
      bech32: 'bch',
      bip32: {
        public: 0x0488B21E,
        private: 0x0488ade4,
      },
      pubKeyHash: 0x00,
      scriptHash: 0x05,
      wif: 0x80,
    };

    let cryptoNetwork = bitcoin.networks[testnet ? 'testnet' : 'bitcoin'];
    if (currencyType === 2) cryptoNetwork = testnet ? LITECOIN_TEST : LITECOIN_MAIN;
    if (currencyType === 3) cryptoNetwork = testnet ? DOGE_TEST : DOGE_MAIN;
    if (currencyType === 5) cryptoNetwork = testnet ? DASH_TEST : DASH_MAIN;
    if (currencyType === 145) cryptoNetwork = testnet ? BCH_TEST : BCH_MAIN;

    let node = bitcoin.bip32.fromBase58(SF, bitcoin.networks[testnet ? 'testnet' : 'bitcoin']); // don't change this
    if (depth > 3) {
      node = node.derive(change).derive(index);
    }

    const { address } = bitcoin.payments.p2pkh({ pubkey: node.publicKey, network: cryptoNetwork });

    this._logger.debug('getCryptoAddress Public Key =====', node.publicKey.toString('hex'));

    // if address is bch, format it
    return {
      address: (currencyType === 145) ? bchaddr.toCashAddress(address) : address,
      publicKey: node.publicKey,
    };
  }
}

module.exports = ExtendedKey;
