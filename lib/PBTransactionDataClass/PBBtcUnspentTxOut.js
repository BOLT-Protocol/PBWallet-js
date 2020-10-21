class PBBtcUnspentTxOut {
  constructor(
    txid, vout, type, address, amount, chainIndex, keyIndex,
    script, timestamp, locked,
  ) {
    this._txid = txid;
    this._vout = vout;
    this._type = type;
    this._address = address;
    this._amount = amount;
    this._chainIndex = chainIndex;
    this._keyIndex = keyIndex;
    this._script = script;
    this._timestamp = timestamp;
    this._locked = locked;
  }

  static fromMap(map) {
    const txOut = new PBBtcUnspentTxOut(
      map[PBBtcUnspentTxOut.FieldNameTxId],
      map[PBBtcUnspentTxOut.FieldNameVout],
      map[PBBtcUnspentTxOut.FieldNameType],
      map[PBBtcUnspentTxOut.FieldNameAddress],
      map[PBBtcUnspentTxOut.FieldNameAmount],
      map[PBBtcUnspentTxOut.FieldNameChainIndex],
      map[PBBtcUnspentTxOut.FieldNameKeyIndex],
      map[PBBtcUnspentTxOut.FieldNameScript],
      map[PBBtcUnspentTxOut.FieldNameTimestamp],
      map[PBBtcUnspentTxOut.FieldNameLocked],
    );
    return txOut;
  }

  static get ClassName() { return 'CABtcUnspentTxOut'; }

  static get FieldNameTxId() { return 'txid'; }

  static get FieldNameVout() { return 'vout'; }

  static get FieldNameType() { return 'type'; }

  static get FieldNameAddress() { return 'address'; }

  static get FieldNameAmount() { return 'amount'; }

  static get FieldNameChainIndex() { return 'chainIndex'; }

  static get FieldNameKeyIndex() { return 'keyIndex'; }

  static get FieldNameScript() { return 'script'; }

  static get FieldNameTimestamp() { return 'timestamp'; }

  static get FieldNameLocked() { return 'locked'; }

  get map() {
    return {
      [PBBtcUnspentTxOut.FieldNameTxId]: this._txid,
      [PBBtcUnspentTxOut.FieldNameVout]: this._vout,
      [PBBtcUnspentTxOut.FieldNameType]: this._type,
      [PBBtcUnspentTxOut.FieldNameAddress]: this._address,
      [PBBtcUnspentTxOut.FieldNameAmount]: this._amount,
      [PBBtcUnspentTxOut.FieldNameChainIndex]: this._chainIndex,
      [PBBtcUnspentTxOut.FieldNameKeyIndex]: this._keyIndex,
      [PBBtcUnspentTxOut.FieldNameScript]: this._script,
      [PBBtcUnspentTxOut.FieldNameTimestamp]: this._timestamp,
      [PBBtcUnspentTxOut.FieldNameLocked]: this._locked,
    };
  }
}

module.exports = PBBtcUnspentTxOut;
