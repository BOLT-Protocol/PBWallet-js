class PBBitcoinTransaction {
  constructor(txid, locktime, timestamp, confirmations, direction, sourceAddresses,
    destinationAddresses, amount, fee, note, unspentTxOuts = []) {
    this._txid = txid;
    this._locktime = locktime;
    this._timestamp = timestamp;
    this._confirmations = confirmations;
    this._direction = direction;
    this._sourceAddresses = sourceAddresses;
    this._destinationAddresses = destinationAddresses;
    this._amount = amount;
    this._fee = fee;
    this._note = note;
    this._unspentTxOuts = unspentTxOuts;
  }

  get txid() { return this._txid; }

  get locktime() { return this._locktime; }

  get timestamp() { return this._timestamp; }

  get confirmations() { return this._confirmations; }

  get direction() { return this._direction; }

  get sourceAddresses() { return this._sourceAddresses; }

  get destinationAddresses() { return this._destinationAddresses; }

  get amount() { return this._amount; }

  get fee() { return this._fee; }

  get note() { return this._note; }

  get unspentTxOuts() { return this._unspentTxOuts; }

  static fromMap(map) {
    const transaction = new PBBitcoinTransaction(
      map[PBBitcoinTransaction.FieldNameTxId],
      map[PBBitcoinTransaction.FieldNameLocktime],
      map[PBBitcoinTransaction.FieldNameTimestamp],
      map[PBBitcoinTransaction.FieldNameConfirmations],
      map[PBBitcoinTransaction.FieldNameDirection],
      map[PBBitcoinTransaction.FieldNameSourceAddresses],
      map[PBBitcoinTransaction.FieldNameDestinationAddresses],
      map[PBBitcoinTransaction.FieldNameAmount],
      map[PBBitcoinTransaction.FieldNameFee],
      map[PBBitcoinTransaction.FieldNameNote],
    );
    return transaction;
  }

  static get ClassName() { return 'CABitcoinTransaction'; }

  static get FieldNameTxId() { return 'txid'; }

  static get FieldNameLocktime() { return 'locktime'; }

  static get FieldNameTimestamp() { return 'timestamp'; }

  static get FieldNameConfirmations() { return 'confirmations'; }

  static get FieldNameDirection() { return 'direction'; }

  static get FieldNameSourceAddresses() { return 'sourceAddresses'; }

  static get FieldNameDestinationAddresses() { return 'destinationAddresses'; }

  static get FieldNameAmount() { return 'amount'; }

  static get FieldNameFee() { return 'fee'; }

  static get FieldNameNote() { return 'note'; }

  get map() {
    return {
      [PBBitcoinTransaction.FieldNameTxId]: this._txid,
      [PBBitcoinTransaction.FieldNameLocktime]: this._locktime,
      [PBBitcoinTransaction.FieldNameTimestamp]: this._timestamp,
      [PBBitcoinTransaction.FieldNameConfirmations]: this._confirmations,
      [PBBitcoinTransaction.FieldNameDirection]: this._direction,
      [PBBitcoinTransaction.FieldNameSourceAddresses]: this._sourceAddresses,
      [PBBitcoinTransaction.FieldNameDestinationAddresses]: this._destinationAddresses,
      [PBBitcoinTransaction.FieldNameAmount]: this._amount,
      [PBBitcoinTransaction.FieldNameFee]: this._fee,
      [PBBitcoinTransaction.FieldNameNote]: this._note,
    };
  }
}

module.exports = PBBitcoinTransaction;
