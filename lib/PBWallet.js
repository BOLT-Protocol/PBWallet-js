const crypto = require('crypto');
const PBEventEmitter = require('./PBEventEmitter');
const PBLog = require('./PBLog');
const Utils = require('./utils/utils');
const DBController = require('./Database/controller/DBController');
const HDWallet = require('./utils/HDWallet');
const PBAsset = require('./PBAsset');

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

  async init() {
    // init or get env
    this.config = await Utils._initConfig();
    this.logger = new PBLog(this.config);
    this.dbController = await DBController({ CHAIN_ENV: this.config.CHAIN_ENV, eventEmitter: this.event });

    // check has user
    const findUsers = await this.dbController.fetchAll('user', {});
    this.config.userMode = (findUsers.length > 0);
    // if no user, get default device 0
    if (!this.config.userMode) {
      // check default device 0 is exist
      const findDevices = await this.dbController.fetchAll('device', {});
      if (findDevices.length > 0) {
        [this.config.device] = findDevices;
      } else {
        this.config._uniqueId = crypto.randomBytes(16).toString('hex').toUpperCase();
        await this.dbController.insert('device', { id: 1, uniqueId: this.config._uniqueId });
        this.config.device = {
          id: 1,
          uniqueId: this.config._uniqueId,
        };
      }
    }

    // init asset sync
    PBAsset(this.config, this.dbController);

    return this;
  }

  async Initialize(mnemonic, passphrase, currencyType, testnet, lang) {
    this.HDWallet = await HDWallet(mnemonic, passphrase, currencyType, testnet, lang);
    return this;
  }
}

module.exports = new PBWallet();
