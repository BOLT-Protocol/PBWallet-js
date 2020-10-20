const PBEventEmitter = require('./PBEventEmitter');
const PBLog = require('./PBLog');
const Utils = require('./utils/utils');
const DBController = require('./Database/controller/DBController');
const HDWallet = require('./utils/HDWallet');

/**
 * Expose `PBWallet` class.
 */
class PBWallet {
  constructor() {
    this._coldWallet = null;
    this._numberOfAccount = 0;
    this._account = null;
    this.dbController = null;
    this.HDWallet = null;
    this.config = {};
    this.logger = console;
    this.event = PBEventEmitter;
  }

  async Initialize(mnemonic, passphrase, currencyType, testnet, lang) {
    // init or get env
    this.config = await Utils._initConfig();
    this.logger = new PBLog(this.config);
    this.dbController = await DBController({ CHAIN_ENV: this.config.CHAIN_ENV, eventEmitter: this.event });
    this.HDWallet = await HDWallet(mnemonic, passphrase, currencyType, testnet, lang);
    return this;
  }
}

module.exports = new PBWallet();
