const BigNumber = require('bignumber.js');
const PBCryptocurrencyType = require('./utils/PBCryptocurrencyType');

class PBAccount {
  /**
   * @param {PBHdwAccountInfo} accountInfo
   * @param {HDWallet} hdWallet
   * @param {PBLog} logger
   * @param {PBEventEmitter} event
   */
  constructor(accountInfo, hdWallet, logger, event) {
    this._account = accountInfo.account;
    this._timestamp = accountInfo.timestamp;
    this._uid = accountInfo.uid;
    this._accountIndex = accountInfo.accountIndex;
    this._cryptocurrencyType = accountInfo.cryptocurrencyType;
    this._name = accountInfo.name;
    this._balance = accountInfo.balance;
    this._balanceInCoinUnit = null;
    this._numberOfUsedExternalKey = accountInfo.numberOfUsedExternalKey;
    this._numberOfUsedInternalKey = accountInfo.numberOfUsedInternalKey;
    this._isSyncing = false;
    this._hdw = hdWallet;
    this._logger = logger;
    this._event = event;

    this._cryptocurrencyService = null;
    this._transactions = null;
    this._tokens = null;
  }

  get uid() { return this._uid; }

  get cryptocurrencyService() { return this._cryptocurrencyService; }

  get path() {
    return `m/84'/3324'/0'/0'/${this._account}'`;
  }

  get address() { return this._cryptocurrencyService.address; }

  get isInitialized() { return (this._cryptocurrencyService != null); }

  get name() { return this._name; }

  get balance() {
    if (this._balanceInCoinUnit != null) return this._balanceInCoinUnit;
    if (this._cryptocurrencyService != null) return this._cryptocurrencyService.toCoinUnit(new BigNumber(this._balance));
    return '0';
  }

  /* return: Array<ATCryptocurrencyTransaction>
   */
  get transactions() { return (this._transactions == null) ? [] : this._transactions; }

  /* return: Array<ATCryptocurrencyToken> */
  get tokens() {
    if (this._tokens == null || !Object.keys(this._tokens).length) return [];
    const list = Object.values(this._tokens);
    list.sort((a, b) => {
      if (a.tokenInfo.name < b.tokenInfo.name) return -1;
      if (a.tokenInfo.name > b.tokenInfo.name) return 1;
      return 0;
    });
    return list;
  }

  get isSyncing() { return this._isSyncing; }

  async stop() {
    if (this._cryptocurrencyService) {
      this._cryptocurrencyService.stop();
      this._cryptocurrencyService = null;
    }
  }

  /**
   * rename
   * index(in): int
   * name(in): String
   */
  async rename(name) {
    this._name = name;
  }

  /* address(in): String
   */
  checkAddressValidity(address) {
    try {
      return this._cryptocurrencyService.checkAddressValidity(address);
    } catch (e) {
      return false;
    }
  }

  /* amount(in): String
   * message(in): String
   */
  async calculateLowFee(amount, message, inSmallestUnit) {
    const result = await this._cryptocurrencyService.calculateLowFee(amount, message, inSmallestUnit);
    this._logger.debug('calculateLowFee result:', result);
    return { fee: result.fee, feeType: 'slow' };
  }

  /* amount(in): String
   * message(in): String
   */
  async calculateMediumFee(amount, message, inSmallestUnit) {
    const result = await this._cryptocurrencyService.calculateMediumFee(amount, message, inSmallestUnit);
    this._logger.debug('calculateMediumFee result:', result);
    return { fee: result.fee, feeType: 'middle' };
  }

  /* amount(in): String
   * message(in): String
   */
  async calculateHighFee(amount, message, inSmallestUnit) {
    const result = await this._cryptocurrencyService.calculateHighFee(amount, message, inSmallestUnit);
    this._logger.debug('calculateHighFee result:', result);
    return { fee: result.fee, feeType: 'fast' };
  }

  async calculateTokenLowFee(amount, message, inSmallestUnit) {
    const result = await this._cryptocurrencyService.calculateTokenLowFee(amount, message, inSmallestUnit);
    this._logger.debug('calculateTokenLowFee result:', result);
    return { fee: result.fee, feeType: 'slow' };
  }

  async calculateTokenHighFee(amount, message, inSmallestUnit) {
    const result = await this._cryptocurrencyService.calculateTokenHighFee(amount, message, inSmallestUnit);
    this._logger.debug('calculateTokenHighFee result:', result);
    return { fee: result.fee, feeType: 'fast' };
  }

  async calculateTokenMediumFee(amount, message, inSmallestUnit) {
    const result = await this._cryptocurrencyService.calculateTokenMediumFee(amount, message, inSmallestUnit);
    this._logger.debug('calculateTokenMediumFee result:', result);
    return { fee: result.fee, feeType: 'middle' };
  }

  /* inSmallestUnit(in): boolean
   */
  async getMaxOutputAmount(inSmallestUnit) {
    const result = await this._cryptocurrencyService.getMaxOutputAmount(inSmallestUnit);
    this._logger.debug('getMaxOutputAmount result:', result);
    return result;
  }

  async getTokenMaxOutputAmount(inSmallestUnit, tokenInfo) {
    const result = await this._cryptocurrencyService.getTokenMaxOutputAmount(inSmallestUnit, tokenInfo);
    this._logger.debug('getMaxOutputAmount result:', result);
    return result;
  }

  /**
   * prepareTransaction
   * amount(in): String
   * fee(in): String
   * to(in): String
   * message(in): String
   */
  async prepareTransaction({
    amount, fee, to, message, isTokenTransfer = false, tokenInfo, tag = null,
  }) {
    let tx = null;
    if (isTokenTransfer) {
      tx = this._cryptocurrencyService.createTokenTransaction(amount, fee, to, message, tokenInfo);
    } else {
      tx = this._cryptocurrencyService.createTransaction(amount, fee, to, message, tag);
    }

    let { transaction } = tx;

    if (transaction.cryptocurrencyType.type !== PBCryptocurrencyType.xrp) {
      transaction = this._cryptocurrencyService.generateTransactionDataForSigning(transaction);
      this._accountIndex = this._cryptocurrencyService.toSmallestUnit(new BigNumber(transaction.amount)).toFixed();
    }
  }

  /* transaction(in): ATCryptocurrencyTransaction
   */
  async _signTransaction(transaction) {
    // TODO: call HDWallet to sign

    const signedTx = this._cryptocurrencyService.generateSignedTransaction(transaction);
    await this._cryptocurrencyService.publishTransaction(signedTx.transaction);
  }
}

module.exports = PBAccount;
