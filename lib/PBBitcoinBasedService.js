const BigNumber = require('bignumber.js');

const utils = require('./utils/utils');
const PBBtcSyncMetadata = require('./PBTransactionDataClass/PBBtcSyncMetadata');
const PBBitcoinTransaction = require('./PBTransactionDataClass/PBBitcoinTransaction');
const PBBtcUnspentTxOut = require('./PBTransactionDataClass/PBBtcUnspentTxOut');
const PBBtcFeesPerByte = require('./PBTransactionDataClass/PBBtcFeesPerByte');
const Converter = require('./utils/Converter');
const PBCryptocurrencyTransaction = require('./utils/PBCryptocurrencyTransaction');

const INDEX_EXTERNALCHAIN = 0;

class PBBitcoinBasedService {
  /**
   * @param {PBLog} logger
   * @param {DBController} dbController
   * @param {string} CHAIN_ENV
   * @param {PBCryptocurrencyType} cryptocurrencyType
   * @param {HDWallet} hdwallet
   * @param {string} uid
   * @param {PBSegWitType} segwitType
   */
  constructor({
    logger, dbController, config, cryptocurrencyType, hdwallet, segwitType,
  }) {
    this._logger = logger;
    this._chainEnv = config.CHAIN_ENV;
    this.cryptocurrencyType = cryptocurrencyType || {};
    this._hdwallet = hdwallet;
    this._uid = config.uid;
    this._segwitType = segwitType;
    this._numberOfUsedExternalKey = 0;
    this._numberOfUsedInternalKey = 0;
    this._lastSyncTimestamp = 0;
    this._lastFullSyncTimestamp = 0;
    this._isStopped = false;
    this._isSyncing = false;
    this._balance = new BigNumber(0);
    this._transactions = [];
    this._unspentTxOuts = [];
    this._appUniqueId = '';
    this.dbController = dbController;
    this._setIntervalList = [];

    this.slowFeePerByte = cryptocurrencyType.lowFeePerByte;
    this.standardFeePerByte = cryptocurrencyType.mediumFeePerByte;
    this.fastFeePerByte = cryptocurrencyType.highFeePerByte;
  }

  get _fullSyncInterval() { return this.cryptocurrencyType.fullSyncInterval; } // 8 hours

  get _partialSyncInterval() { return this.cryptocurrencyType.partialSyncInterval; } // 5 minute

  get _gapLimit() { return 5; } // standard is 20

  get _minFeePerByte() { return 1; }

  get _lowFeePerByte() { return this.slowFeePerByte; }

  get _mediumFeePerByte() { return this.standardFeePerByte; }

  get _highFeePerByte() { return this.fastFeePerByte; }

  get _apiKey() { return this.cryptocurrencyType.apiKey; }

  get address() {
    const address = this._getAddress(INDEX_EXTERNALCHAIN, this._numberOfUsedExternalKey);
    this._address = address;
    return address;
  }

  async start() {
    this._logger.info('start()');
    this._isStopped = false;
    this._isSyncing = false;
    await this._start();
  }

  async _start() {
    this._logger.info('_start()');

    // TODO: this._appUniqueId should load device uuid from db
    this._appUniqueId = utils.randomStr(32);

    let metadata = await this._fetchOnePBBtcSyncMetadata();

    if (!metadata) {
      metadata = new PBBtcSyncMetadata(
        this._uid, // uid
        0, // numberOfUsedExternalPubKey
        0, // numberOfUsedInternalPubKey
        0, // lastSyncTime
        0, // lastFullSyncTime
      );

      await this._insertOnePBBtcSyncMetadata(metadata);
    }

    this._lastSyncTimestamp = metadata.lastSyncTime;
    this._lastFullSyncTimestamp = metadata.lastFullSyncTime;

    await this._loadTxFees();
    await this._loadTransactions();
    await this._loadUnspentTxOuts();
    this._sync();

    const timer = setInterval(() => {
      if (this._isStopped) return;
      this._sync();
    }, this.cryptocurrencyType.partialSyncInterval);
    this._setIntervalList.push(timer);
  }

  stop() {
    this._isStopped = true;
    this._setIntervalList.forEach((timer) => {
      clearInterval(timer);
    });
  }

  /**
   * return BTC value from satoshi value in BigNumber
   * @param {BigNumber} value - satoshi value
   */
  toCoinUnit(value) {
    return Converter.toBtc(value);
  }

  /**
   * return satoshi value from BTC value in BigNumber
   * @param {BigNumber} value - BTC value
   */
  toSmallestUnit(value) {
    return Converter.toSatoshi(value);
  }

  async _fetchAllPBBitcoinTransaction({ where = '', whereArgs = [], order = 'ORDER BY tx_timestamp ASC' }) {
    let dbTxs = [];
    try {
      const newWhere = `${where} && account_id = ?`;
      const newWhereArgs = [...whereArgs, this._uid];
      dbTxs = await this.dbController.fetchAll('_transaction', { where: newWhere, whereArgs: newWhereArgs, order });
    } catch (error) {
      this.logger.error(error);
      return null;
    }
    if (this._isStopped) return null;
    const results = dbTxs.map((tx) => new PBBitcoinTransaction(
      tx.txid, tx.locktime, tx.timestamp, tx.confirmations, tx.direction, tx.source_addresses,
      tx.desticnation_addresses, tx.amount, tx.fee, tx.note,
    ));
    return results;
  }

  async _insertOnePBBitcoinTransaction(pbBitcoinTransaction) {
    const txObj = pbBitcoinTransaction.map;
    txObj.account_id = this._uid;
    try {
      return this.dbController.insertOne('_transaction', txObj);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async _fetchAllPBBtcUnspentTxOut({ where = '', whereArgs = [], order = 'ORDER BY utxo_timestamp ASC' }) {
    let dbUtxos = [];
    try {
      const newWhere = `${where} && account_id = ?`;
      const newWhereArgs = [...whereArgs, this._uid];
      dbUtxos = await this.dbController.fetchAll('utxo', { where: newWhere, whereArgs: newWhereArgs, order });
    } catch (error) {
      this.logger.error(error);
      return null;
    }
    if (this._isStopped) return null;
    const results = dbUtxos.map((tx) => new PBBtcUnspentTxOut(
      tx.txid, tx.vout, tx.utxo_type, tx.addresses, tx.amount, tx.chain_index,
      tx.key_index, tx.sequence, tx.timestamp, tx.locked,
    ));
    return results;
  }

  async _insertOnePBBtcUnspentTxOut(pbBtcUnspentTxOut) {
    const utxoObj = pbBtcUnspentTxOut.map;
    utxoObj.account_id = this._uid;
    try {
      return this.dbController.insertOne('utxo', utxoObj);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async _deleteAllPBBtcUnspentTxOut({ where = '', whereArgs = [] }) {
    try {
      const newWhere = `${where} && account_id = ?`;
      const newWhereArgs = [...whereArgs, this._uid];
      return this.dbController.deleteAll('utxo', { where: newWhere, whereArgs: newWhereArgs });
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async _fetchOnePBBtcSyncMetadata() {
    let account = {};
    try {
      account = await this.dbController.fetchOne('account', { where: 'id = ?', whereArgs: [this._uid] });
    } catch (error) {
      this.logger.error(error);
      return null;
    }
    if (this._isStopped) return null;
    const results = new PBBtcSyncMetadata(
      account.id, account.number_of_used_external_key, account.number_of_used_internal_key,
      account.last_sync_time, account.last_full_sync_time,
    );
    return results;
  }

  async _insertOnePBBtcSyncMetadata(pbBtcSyncMetadata) {
    const syncMetadataObj = pbBtcSyncMetadata.map;
    try {
      return this.dbController.insertOne('account', syncMetadataObj);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async _fetchOnePBBtcFeesPerByte({ where = '', whereArgs = [] }) {
    let fee = {};
    try {
      const currency = await this.dbController.fetchOne('currency', { where: 'currency_type = ?', whereArgs: [this.cryptocurrencyType.value] });
      const newWhere = `${where} && currency_id = ?`;
      const newWhereArgs = [...whereArgs, currency.id];
      fee = await this.dbController.fetchOne('transaction_fee', { where: newWhere, whereArgs: newWhereArgs });
    } catch (error) {
      this.logger.error(error);
      return null;
    }
    if (this._isStopped) return null;
    const results = new PBBtcFeesPerByte(
      fee.network, fee.slow, fee.standard, fee.fast, fee.transaction_fee_timestamp,
    );
    return results;
  }

  async _insertOnePBBtcFeesPerByte(pbBtcFeesPerByte) {
    const feeObj = pbBtcFeesPerByte.map;
    try {
      const currency = await this.dbController.fetchOne('currency', { where: 'currency_type = ?', whereArgs: [this.cryptocurrencyType.value] });
      feeObj.currency_id = currency.id;
      return this.dbController.fetchOne('transaction_fee', feeObj);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async _sync() {
    this.logger.info('_sync()');
    if (this._isSyncing) return;
    this._isSyncing = true;

    const now = Math.floor(new Date());
    if ((now - this._lastFullSyncTimestamp) > this.cryptocurrencyType.fullSyncInterval) {
      await this._fullSync();
      this._lastFullSyncTimestamp = now;
      this._lastSyncTimestamp = now;
      // TODO: What if user quits App before sync done every time? We need to prevent that App does full sync every time, but user may never finish a full sync.
      const syncMeta = new PBBtcSyncMetadata(
        this._uid,
        this._numberOfUsedExternalKey,
        this._numberOfUsedInternalKey,
        this._lastFullSyncTimestamp,
        (this._isStopped) ? 0 : this._lastSyncTimestamp,
      );
      await this._insertOnePBBtcSyncMetadata(syncMeta);
    } else if ((now - this._lastSyncTimestamp) > this.cryptocurrencyType.partialSyncInterval) {
      await this._partialSync();
      this._lastSyncTimestamp = now;
      const syncMeta = new PBBtcSyncMetadata(
        this._uid,
        this._numberOfUsedExternalKey,
        this._numberOfUsedInternalKey,
        this._lastFullSyncTimestamp,
        (this._isStopped) ? 0 : this._lastSyncTimestamp,
      );
      await this._insertOnePBBtcSyncMetadata(syncMeta);
    }

    await this._loadTransactions();
    await this._loadUnspentTxOuts();

    // TODO: set event
    // statusListener.add({
    //   event: atEvent.Evt_OnSyncStopped,
    //   data: {
    //     uid: this._uid,
    //   },
    // });

    this._isSyncing = false;
    if (this._isStopped && this._database != null) this._database.close();
  }

  async _loadTxFees() {
    const feesPerByte = await this._fetchOnePBBtcFeesPerByte({
      where: 'network = ?', whereArgs: [this._chainEnv ? 'testnet' : 'mainnet'],
    });
    if (!feesPerByte) return;
    this.slowFeePerByte = feesPerByte.slow;
    this.standardFeePerByte = feesPerByte.standard;
    this.fastFeePerByte = feesPerByte.fast;
  }

  async _loadUnspentTxOuts() {
    this.logger.debug('_loadUnspentTxOuts()');
    const utxos = await this._fetchAllPBBtcUnspentTxOut({ order: 'ORDER BY utxo_timestamp ASC' });

    let amount = new BigNumber(0);
    for (let i = 0; i < utxos.length; i++) {
      amount = amount.plus(new BigNumber(utxos[i].amount));
    }
    if (this._isStopped) return;
    if (this._balance.toFixed() !== amount.toFixed()) {
      this.logger.debug('_loadUnspentTxOuts() atEvent.Evt_OnBalanceChanged balance:', amount.toFixed());
      // TODO: set event
      // statusListener.add({
      //   event: atEvent.Evt_OnBalanceChanged,
      //   data: {
      //     uid: this._uid,
      //     balance: amount.toFixed(),
      //     wei: 8,
      //   },
      // });
    }
    this._balance = amount;
    this._unspentTxOuts = utxos;
  }

  async _loadTransactions() {
    this.logger.debug('_loadTransactions()');
    const btcTransactions = await this._fetchAllPBBitcoinTransaction({ sort: 'ORDER BY tx_timestamp ASC' });
    this._transactions = btcTransactions.map((tx) => PBCryptocurrencyTransaction.fromPBBitcoinTransaction(this.cryptocurrencyType, tx));

    const metadata = await this._fetchOnePBBtcSyncMetadata();
    this._numberOfUsedExternalKey = metadata.numberOfUsedExternalPubKey;
    this._numberOfUsedInternalKey = metadata.numberOfUsedInternalPubKey;

    // TODO: set event
    // statusListener.add({
    //   event: atEvent.Evt_OnTransactionChanged,
    //   data: {
    //     uid: this._uid,
    //     transactions: btcTransactions,
    //     numberOfUsedExternalKey: this._numberOfUsedExternalKey,
    //     numberOfUsedInternalKey: this._numberOfUsedInternalKey,
    //   },
    // });
  }
}

module.exports = PBBitcoinBasedService;
