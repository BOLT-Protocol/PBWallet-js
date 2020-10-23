/* eslint-disable prefer-destructuring */
const BigNumber = require('bignumber.js');

const PBTransactionDirection = require('./PBTransactionDirection');
const PBCryptocurrencyType = require('./PBCryptocurrencyType');
const PBTokenInfo = require('./PBTokenInfo');
const PBUnspentTxOut = require('./PBUnspentTxOut');
const Converter = require('./Converter');

class PBCryptocurrencyTransaction {
  /**
   * @param {PBCryptocurrencyType} type
   * @param {String} txId
   * @param {PBTransactionDirection} direction
   * @param {String} address
   * @param {String} amount
   * @param {String} fee
   * @param {Number} confirmations
   * @param {Number} timestamp
   * @param {String} note
   * @param {boolean} isTokenTransfer
   * @param {PBTokenInfo} tokenInfo
   * @param {String} status for Ripple
   */
  constructor(
    type, txId, direction, address, amount, fee, confirmations, timestamp, note, isTokenTransfer = false, tokenInfo, tx = {}, status,
  ) {
    this._cryptocurrencyType = type;
    this._txId = txId;
    this._direction = direction;
    this._address = address;
    this._amount = amount; // in eth
    this._fee = fee; // in eth
    this._confirmations = confirmations;
    this._timestamp = timestamp;
    this._note = note;
    this._isTokenTransfer = isTokenTransfer;
    this._tokenInfo = tokenInfo;
    this._status = status; // for Ripple
    this._data = {};
    this._tx = tx;
  }

  get txId() { return this._txId; }

  get address() { return this._address; }

  get amount() { return this._amount; }

  get fee() { return this._fee; }

  get dateTime() { return this._timestamp; }

  get cryptocurrencyType() { return this._cryptocurrencyType; }

  get direction() { return this._direction; }

  get note() { return this._note; }

  get isTokenTransfer() { return this._isTokenTransfer; }

  get utxos() { return this._data.utxos; }

  get rlpData() { return this._data.rawTx; }

  get rawTx() { return this._data.rawTx; }

  get confirmations() { return this._confirmations; }

  get tokenInfo() { return this._tokenInfo; }

  get status() { return this._status; }

  get tx() { return this._tx; }

  get description() { return this._direction.description; }

  set utxos(utxos) {
    this._data.utxos = utxos;
  }

  set rlpData(data) {
    this._data.rawTx = data;
  }

  set rawTx(data) {
    this._data.rawTx = data;
  }

  get serializedData() {
    const list = [this._txId, this._address, this._amount, this._fee,
      this._timestamp, this._confirmations, this._cryptocurrencyType.value,
      this._direction.value, this._note, this._isTokenTransfer,
      (this._isTokenTransfer) ? this._tokenInfo.serializedData : null,
      this._data.rawTx];

    if (!this._data.utxos) return list;

    const utxoList = [];
    this._data.utxos.forEach((item) => {
      utxoList.push(item.serializedData);
    });
    list.push(utxoList);

    return list;
  }

  static fromSerializedData(data) {
    const cryptocurrencyType = PBCryptocurrencyType.createByValue(data[6]);

    const direction = PBTransactionDirection.createByValue(data[7]);

    const pbCryptocurrencyTransaction = new PBCryptocurrencyTransaction(
      cryptocurrencyType, data[0], direction, data[1], data[2], data[3], data[5],
      data[4], data[8], data[9], (data[9] ? PBTokenInfo.fromSerializedData(data[10]) : null),
    );
    pbCryptocurrencyTransaction.rawTx = data[11];
    if (data.length > 12) {
      const utxos = [];
      data[12].forEach((item) => {
        utxos.push(PBUnspentTxOut.fromSerializedData(item));
      });
      pbCryptocurrencyTransaction.utxos = utxos;
    }
    return pbCryptocurrencyTransaction;
  }

  /* ownerAddress(in): String
   * cryptocurrencyType(in): PBCryptocurrencyType
   * transaction(in): CAEtherTransaction
   * return: PBCryptocurrencyTransaction
   */
  static fromCAEtherTransaction(ownerAddress, cryptocurrencyType, transaction) {
    const gasPrice = new BigNumber(transaction.gasPrice);
    const gasUsed = new BigNumber(transaction.gasUsed);
    const feeWei = gasPrice.multipliedBy(gasUsed);
    let direction = '';
    let address = '';
    if (transaction.fromAddr.toLowerCase() === transaction.toAddr.toLowerCase()) {
      direction = new PBTransactionDirection(PBTransactionDirection.moved);
      address = transaction.from;
    } else if (transaction.fromAddr.toLowerCase() === ownerAddress.toLowerCase()) {
      direction = new PBTransactionDirection(PBTransactionDirection.sent);
      address = transaction.to;
    } else {
      direction = new PBTransactionDirection(PBTransactionDirection.received);
      address = transaction.from;
    }

    const pbCryptocurrencyTransaction = new PBCryptocurrencyTransaction(
      cryptocurrencyType, transaction.txHash, direction, address,
      Converter.toEther(new BigNumber(transaction.value)).toString(),
      Converter.toEther(feeWei).toString(), transaction.confirmations, transaction.timestamp,
      '', false, null,
    );
    return pbCryptocurrencyTransaction;
  }

  /* cryptocurrencyType(in): PBCryptocurrencyType
   * transaction(in): web3dart.Transaction (???)
   * estimatedUsedGas(in): int
   * tokenInfo(in): PBTokenInfo
   */
  static fromWeb3DartTransaction(
    cryptocurrencyType, transaction, tokenInfo = null,
  ) {
    this._cryptocurrencyType = cryptocurrencyType;
    this._direction = PBTransactionDirection.sent;
    this._address = transaction.to.toString('hex');
    this._amount = new BigNumber(transaction.value.toString('hex'), 16).toFixed();
    const gasPrice = transaction.gasPrice.toString('hex');
    const gasLimit = transaction.gasLimit.toString('hex');
    this._fee = new BigNumber(gasPrice, 16).multipliedBy(new BigNumber(gasLimit, 16)).toFixed();

    const rlpData = transaction.serialize();
    if (tokenInfo != null) {
      // this._fee = (transaction.gasPrice.getInWei.toDouble() / 1e9).toString(); // Gas Price
      this._isTokenTransfer = true;
      this._tokenInfo = tokenInfo;
    }
    const pbCryptocurrencyTransaction = new PBCryptocurrencyTransaction(
      cryptocurrencyType, '', PBTransactionDirection.sent, this._address,
      this._amount, this._fee, 0, 0,
      '', this._isTokenTransfer || false, this._tokenInfo, transaction,
    );
    pbCryptocurrencyTransaction._tx = transaction;
    pbCryptocurrencyTransaction._data.rawTx = rlpData;
    return pbCryptocurrencyTransaction;
  }

  /**
   * @param {PBCryptocurrencyType} cryptocurrencyType
   * @param {PBBitcoinTransaction} transaction
   */
  static fromPBBitcoinTransaction(cryptocurrencyType, transaction) {
    const direction = PBTransactionDirection.createByValue(transaction.direction);
    const address = (transaction.direction === PBTransactionDirection.sent) ? transaction.destinationAddresses : transaction.sourceAddresses;
    const pbCryptocurrencyTransaction = new PBCryptocurrencyTransaction(
      cryptocurrencyType, transaction.txid, direction, address, transaction.amount,
      transaction.fee, transaction.confirmations, transaction.timestamp,
      '', false, null,
    );
    return pbCryptocurrencyTransaction;
  }

  /* cryptocurrencyType(in): PBCryptocurrencyType
   * tokenInfo(in): PBTokenInfo
   * transaction(in): CAEthereumTokenTransaction
   */
  static fromCAEthereumTokenTransaction(cryptocurrencyType, tokenInfo, transaction) {
    const direction = (transaction.ownerAddress === transaction.toAddr) ? new PBTransactionDirection(PBTransactionDirection.received) : new PBTransactionDirection(PBTransactionDirection.sent);
    const pbCryptocurrencyTransaction = new PBCryptocurrencyTransaction(
      cryptocurrencyType, transaction.txHash, direction,
      /* address */ (direction.direction === PBTransactionDirection.sent) ? transaction.toAddr : transaction.fromAddr,
      transaction.value, '0', 1, transaction.timestamp, '', true, tokenInfo,
    );
    return pbCryptocurrencyTransaction;
  }

  static fromCAXrpTransaction(cryptocurrencyType, transaction) {
    const txId = transaction.txHash;
    const amount = transaction.value;
    const { timestamp } = transaction;
    const { confirmations } = transaction;
    const { fee } = transaction;
    const { status } = transaction;

    let direction = new PBTransactionDirection(PBTransactionDirection.received);
    let address = transaction.from;
    if (transaction.from === transaction.to) {
      direction = new PBTransactionDirection(PBTransactionDirection.moved);
      address = transaction.from;
    } else if (transaction.from === transaction.ownerAddress) {
      direction = new PBTransactionDirection(PBTransactionDirection.sent);
      address = transaction.to;
    }
    return new PBCryptocurrencyTransaction(cryptocurrencyType, txId, direction, address,
      amount, fee, confirmations, timestamp,
      '', false, null, status);
  }

  /**
   * @param {XrpPaymentData} xrpPaymentData
   */
  static fromXrpPaymentData(service, xrpPaymentData) {
    this._logger.debug(`xrpPaymentData.amount: ${xrpPaymentData.amount}`);
    this._logger.debug(`xrpPaymentData.fee: ${xrpPaymentData.fee}`);
    const cryptocurrencyType = new PBCryptocurrencyType(PBCryptocurrencyType.xrp);
    const direction = new PBTransactionDirection(PBTransactionDirection.sent);
    const address = xrpPaymentData.destination;
    // const address = xrpPaymentData.destination + ((xrpPaymentData.destinationTag != null) ? `: ${xrpPaymentData.destinationTag}` : '');
    const amount = service.toCoinUnit(new BigNumber(xrpPaymentData.amount)).toFixed();
    const fee = service.toCoinUnit(new BigNumber(xrpPaymentData.fee)).toFixed();
    const rawTx = xrpPaymentData.serializedData;
    this._logger.debug(`xrpPaymentData.serializedData: ${rawTx}`);

    const pbCryptocurrencyTransaction = new PBCryptocurrencyTransaction(cryptocurrencyType, '', direction, address,
      amount, fee, 0, 0,
      '', false, null, '');
    pbCryptocurrencyTransaction.rawTx = rawTx;
    return pbCryptocurrencyTransaction;
  }
}

module.exports = PBCryptocurrencyTransaction;
