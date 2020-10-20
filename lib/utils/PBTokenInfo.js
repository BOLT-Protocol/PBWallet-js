const TokenType = {
  erc20: 'erc20',
  erc721: 'erc721',
  omniLayer: 'omniLayer',
  unknown: 'unknown',
};

const PBTokenType = {
  erc20: { value: 1, name: 'ERC-20' },
  erc721: { value: 2, name: 'ERC-721' },
  omniLayer: { value: 3, name: 'Omni Layer' },
  unknown: { value: 4, name: 'Unknown' },
};

class PBTokenInfo {
  /**
  * @param {String} address
  * @param {String} name
  * @param {String} symbol
  * @param {PBTokenType} type
  * @param {number} decimals
  * @param {number} totalSupply
  */
  constructor(address, name, symbol, type, decimals, totalSupply) {
    this._address = address;
    this._name = name;
    this._symbol = symbol;
    this._type = type;
    this._decimals = decimals;
    this._totalSupply = totalSupply;
  }

  get address() { return this._address; }

  get name() { return this._name; }

  get symbol() { return this._symbol; }

  get type() { return this._type; }

  get decimals() { return this._decimals; }

  get totalSupply() { return this._totalSupply; }

  get serializedData() {
    return [this._address, this._name, this._symbol, this._type.value, this._decimals, this._totalSupply];
  }

  get map() {
    return {
      address: this._address,
      name: this._name,
      symbol: this._symbol,
      type: this._type,
      decimals: this._decimals,
      totalSupply: this._totalSupply,
    };
  }

  /**
   * @param {Array} data
   */
  static fromSerializedData(data) {
    let pbTokenType = null;
    for (let idx = 0; idx < Object.keys(TokenType).length; idx++) {
      const key = Object.keys(TokenType)[idx];
      if (data[3] === PBTokenType[key].value) {
        pbTokenType = PBTokenType[key];
        break;
      }
    }
    const tokenInfo = new PBTokenInfo(data[0], data[1], data[2], pbTokenType, data[4], data[5]);
    return tokenInfo;
  }
}

module.exports = PBTokenInfo;
