const BigNumber = require('bignumber.js');

const utils = require('./utils/utils');
const PBBtcSyncMetadata = require('./PBTransactionDataClass/PBBtcSyncMetadata');
const PBBitcoinTransaction = require('./PBTransactionDataClass/PBBitcoinTransaction');
const PBBtcUnspentTxOut = require('./PBTransactionDataClass/PBBtcUnspentTxOut');
const PBBtcFeesPerByte = require('./PBTransactionDataClass/PBBtcFeesPerByte');

const INDEX_EXTERNALCHAIN = 0;

class PBBitcoinBasedService {
  /**
   * @param {PBLog} logger
   * @param {DBController} dbController
   * @param {string} CHAIN_ENV
   * @param {PBCryptocurrencyType} cryptocurrencyType
   * @param {ExtendedKey} extPubkey
   * @param {string} uid
   * @param {PBSegWitType} segwitType
   */
  constructor({
    logger, dbController, CHAIN_ENV, cryptocurrencyType, extPubkey, uid, segwitType,
  }) {
    this._logger = logger;
    this._chainEnv = CHAIN_ENV;
    this.cryptocurrencyType = cryptocurrencyType || {};
    this.extPubkey = extPubkey;
    this._uid = uid;
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

    let metadata = await this._fetchOne('account', {
      where: 'id = ?', whereArgs: [this._uid],
    });

    if (!metadata) {
      metadata = new PBBtcSyncMetadata(
        this._uid, // uid
        0, // numberOfUsedExternalPubKey
        0, // numberOfUsedInternalPubKey
        0, // lastSyncTime
        0, // lastFullSyncTime
      );

      await this._insertOne(this.CABtcSyncMetadataClassName, metadata.map);
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

  async _fetchAllPBBitcoinTransaction({ where, whereArgs = [], order = 'ORDER BY Timestamp ASC' }) {
    let dbTxs = [];
    try {
      const newWhere = `${where} && account_id = ?`;
      const newWhereArgs = [...whereArgs, this._uid];
      dbTxs = await this.dbController.fetchAll('_transaction', { newWhere, newWhereArgs, order });
    } catch (error) {
      this.logger.error(error);
      return [];
    }
    if (this._isStopped) return [];
    const results = dbTxs.map((tx) => new PBBitcoinTransaction(
      tx.txid, tx.locktime, tx.timestamp, tx.confirmations, tx.direction, tx.source_addresses,
      tx.desticnation_addresses, tx.amount, tx.fee, tx.note,
    ));
    return results;
  }

  async _insertOnePBBitcoinTransaction(pbBitcoinTransaction) {
    const txObj = pbBitcoinTransaction.map;
    txObj.account_id = this._uid;
    return this.dbController.insertOne('_transaction', txObj);
  }

  async _fetchAllPBBtcUnspentTxOut({ where, whereArgs = [], order = 'ORDER BY Timestamp ASC' }) {
    let dbUtxos = [];
    try {
      const newWhere = `${where} && account_id = ?`;
      const newWhereArgs = [...whereArgs, this._uid];
      dbUtxos = await this.dbController.fetchAll('utxo', { newWhere, newWhereArgs, order });
    } catch (error) {
      this.logger.error(error);
      return [];
    }
    if (this._isStopped) return [];
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
      return error;
    }
  }

  // async _deleteAllPBBtcUnspentTxOut({ where, whereArgs = [] }) {
  //   try {
  //     const newWhere = `${where} && account_id = ?`;
  //     const newWhereArgs = [...whereArgs, this._uid];
  //     await this.dbController.deleteAll('utxo', { newWhere, newWhereArgs });
  //   } catch (error) {
  //     this.logger.error(error);
  //     return [];
  //   }
  // }

  async _fetchOnePBBtcSyncMetadata() {
    let account = {};
    try {
      account = await this.dbController.fetchOne('account', { where: 'id = ?', whereArgs: [this._uid] });
    } catch (error) {
      this.logger.error(error);
      return [];
    }
    if (this._isStopped) return {};
    const results = new PBBtcSyncMetadata(
      account.id, account.number_of_used_external_key, account.number_of_used_internal_key,
      account.last_sync_time, account.last_full_sync_time,
    );
    return results;
  }

  async _fetchOnePBBtcFeesPerByte() {
    let fee = {};
    try {
      const currency = await this.dbController.fetchOne('currency', { where: 'currency_type = ?', whereArgs: [this.cryptocurrencyType.value] });
      fee = await this.dbController.fetchOne('transaction_fee', { where: 'currency_id = ?', whereArgs: [currency.id] });
    } catch (error) {
      this.logger.error(error);
      return [];
    }
    if (this._isStopped) return {};
    const results = new PBBtcFeesPerByte(
      fee.network, fee.slow, fee.standard, fee.fast, fee.transaction_fee_timestamp,
    );
    return results;
  }
}

module.exports = PBBitcoinBasedService;
