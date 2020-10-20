const BigNumber = require('bignumber.js');

class PBUnspentTxOut {
  /**
   * @param {String} txid
   * @param {number} vout
   * @param {number} keyChainIndex
   * @param {number} keyIndex
   * @param {BigNumber} amount
   * @param {Array | Buffer} data
   * @param {String} type
   */
  constructor(txid, vout, keyChainIndex, keyIndex, amount, data, type) {
    this._txid = txid;
    this._vout = vout;
    this._keyChainIndex = keyChainIndex;
    this._keyIndex = keyIndex;
    this._amount = amount;
    this._data = data;
    this._type = type;
  }

  get txid() { return this._txid; }

  get vout() { return this._vout; }

  get keyChainIndex() { return this._keyChainIndex; }

  get keyIndex() { return this._keyIndex; }

  get amount() { return this._amount; }

  get data() { return this._data; }

  get type() { return this._type; }

  get script() { return this._data; }

  get hash() { return this._data; }

  get signature() { return this._data; }

  get serializedData() {
    return [this._txid, this._vout, this._keyChainIndex, this._keyIndex, this._amount.toFixed(), this._data, this._type];
  }

  /**
   * @param {Array} list
   */
  static fromSerializedData(list) {
    const pbUnspentTxOut = new PBUnspentTxOut(list[0], list[1], list[2], list[3], new BigNumber(list[4]), list[5], list[6]);
    return pbUnspentTxOut;
  }
}

module.exports = PBUnspentTxOut;
