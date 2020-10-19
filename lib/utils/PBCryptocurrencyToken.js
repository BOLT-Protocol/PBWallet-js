const PBTokenInfo = require('./PBTokenInfo');
const PBCryptocurrencyTransaction = require('./PBCryptocurrencyTransaction');

class PBCryptocurrencyToken {
  /**
   * @param {String} amount in
   * @param {PBTokenInfo} info in
   * @param {PBCryptocurrencyTransaction} txs in
   */
  constructor(amount, info, txs = []) {
    this.amount = amount;
    this._tokenInfo = info;
    this.transactions = txs;
  }

  get tokenInfo() { return this._tokenInfo; }

  get serializedData() {
    const data = [];
    data.push(this.amount);
    data.push(this._tokenInfo.serializedData);
    data.push(this.transactions.map((transaction) => transaction.serializedData));
    return data;
  }

  /* data(in): Array
   */
  static fromSerializedData(data) {
    const pbCryptocurrencyToken = new PBCryptocurrencyToken(data[0], PBTokenInfo.fromSerializedData(data[1]));
    const txs = data[2];
    txs.forEach((item) => {
      pbCryptocurrencyToken.transactions.push(
        PBCryptocurrencyTransaction.fromSerializedData(item),
      );
    });
    return pbCryptocurrencyToken;
  }
}

module.exports = PBCryptocurrencyToken;
