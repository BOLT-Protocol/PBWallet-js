const BigNumber = require('bignumber.js');

class Converter {
  /** @constant {BigNumber} NOTE: calculate satoshi by 10^8 */
  static btcInSatoshi() { return BigNumber(10 ** 8); }

  /** @constant {BigNumber} NOTE: calculate drop by 10^6 */
  static xrpInDrop() { return BigNumber(10 ** 6); }

  /** @constant {BigNumber} BTC == 100,000,000 satoshi */
  static toBtc(value) {
    return value.dividedBy(Converter.btcInSatoshi());
  }

  /** @constant {BigNumber} BTC == 100,000,000 satoshi */
  static toSatoshi(btc) {
    return btc.multipliedBy(Converter.btcInSatoshi());
  }

  /** @constant {BigNumber}  1 XRP == 1,000,000 drop */
  static toXrp(value) {
    return value.dividedBy(Converter.xrpInDrop());
  }

  /** @constant {BigNumber}  1 XRP == 1,000,000 drop */
  static toDrop(xrp) {
    return xrp.multipliedBy(Converter.xrpInDrop());
  }

  /** @returns {BigNumber} calculate wei by 10^18 */
  static get etherInWei() { return BigNumber(10 ** 18); }

  /**
   * @param  {BigNumber} wei unit
   * @param  {BigNumber} decimals unit, default wei(10^18)
   * @returns {BigNumber} Ether(Decimal) unit
   * */
  static toEther(wei, decimals = Converter.etherInWei) {
    return wei.dividedBy(decimals);
  }

  /**
   * @param  {BigNumber} ether unit
   * @param  {BigNumber} gWei unit
   * @returns {BigNumber} Ether(Decimal) unit
   * */
  static toDecimal({ ether, decimals = Converter.etherInWei, gWei }) {
    if (gWei != null && ether == null) {
      return gWei.multipliedBy(new BigNumber(10 ** 9));
    } if (ether != null) {
      return ether.multipliedBy(decimals);
    }
    return new BigNumber(0);
  }
}

module.exports = Converter;
