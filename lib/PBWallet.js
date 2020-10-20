const PBEventEmitter = require('./PBEventEmitter');
const PBLog = require('./PBLog');
const Utils = require('./utils/utils');
const DBController = require('./Database/controller/DBController');

/**
 * Expose `PBWallet` class.
 */
class PBWallet {
  constructor() {
    this._coldWallet = null;
    this._numberOfAccount = 0;
    this._account = null;
    this.dbController = null;
    this.config = {};
    this.logger = console;
    this.event = PBEventEmitter;
  }

  async Initialize() {
    // init or get env
    this.config = await Utils._initConfig();
    this.logger = new PBLog(this.config);
    this.dbController = await DBController({ CHAIN_ENV: this.config.CHAIN_ENV, eventEmitter: this.event });

    return this;
  }
}

module.exports = new PBWallet();
