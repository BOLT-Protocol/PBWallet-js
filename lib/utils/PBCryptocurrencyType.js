/* eslint-disable getter-return */
/* eslint-disable default-case */

const BigNumber = require('bignumber.js');
const { PBSegWitType } = require('./PBSegWitType.js');

/**
 * @constant {object}
 * crypto currency type(for PBCryptocurrencyType new constructor use)
 */
const CryptocurrencyType = {
  btc: 'btc',
  ltc: 'ltc',
  doge: 'doge',
  dash: 'dash',
  eth: 'eth',
  etc: 'etc',
  xrp: 'xrp',
  bch: 'bch',
};

/**
 * @classdesc PBWallet CryptocurrencyType
 */
class PBCryptocurrencyType {
  /**
   * @param {string} type - CryptocurrencyType value
   */
  constructor(config, logger, type) {
    this._config = config;
    this._logger = logger;
    this._type = type;
  }

  /**
   * @type {string}
   */
  get type() { return this._type; }

  static get btc() { return CryptocurrencyType.btc; }

  static get ltc() { return CryptocurrencyType.ltc; }

  static get doge() { return CryptocurrencyType.doge; }

  static get dash() { return CryptocurrencyType.dash; }

  static get eth() { return CryptocurrencyType.eth; }

  static get etc() { return CryptocurrencyType.etc; }

  static get xrp() { return CryptocurrencyType.xrp; }

  static get bch() { return CryptocurrencyType.bch; }

  /**
   * @type {number}
   */
  get value() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return 0;
      case CryptocurrencyType.ltc:
        return 2;
      case CryptocurrencyType.doge:
        return 3;
      case CryptocurrencyType.dash:
        return 5;
      case CryptocurrencyType.eth:
        return 60;
      case CryptocurrencyType.etc:
        return 61;
      case CryptocurrencyType.xrp:
        return 144;
      case CryptocurrencyType.bch:
        return 145;
      default:
        return -1;
    }
  }

  /**
   * @type {PBCryptocurrencyType}
   * @param {number} value
   */
  static createByValue(value) {
    switch (value) {
      case 0:
        return new PBCryptocurrencyType(CryptocurrencyType.btc);
      case 2:
        return new PBCryptocurrencyType(CryptocurrencyType.ltc);
      case 3:
        return new PBCryptocurrencyType(CryptocurrencyType.doge);
      case 5:
        return new PBCryptocurrencyType(CryptocurrencyType.dash);
      case 60:
        return new PBCryptocurrencyType(CryptocurrencyType.eth);
      case 61:
        return new PBCryptocurrencyType(CryptocurrencyType.etc);
      case 144:
        return new PBCryptocurrencyType(CryptocurrencyType.xrp);
      case 145:
        return new PBCryptocurrencyType(CryptocurrencyType.bch);
      default:
        return null;
    }
  }

  /**
   * return coin type
   * @type {string}
   * @param {number} value
   */
  static valueToType(value) {
    switch (value) {
      case 0:
        return CryptocurrencyType.btc;
      case 2:
        return CryptocurrencyType.ltc;
      case 3:
        return CryptocurrencyType.doge;
      case 5:
        return CryptocurrencyType.dash;
      case 60:
        return CryptocurrencyType.eth;
      case 61:
        return CryptocurrencyType.etc;
      case 144:
        return CryptocurrencyType.xrp;
      case 145:
        return CryptocurrencyType.bch;
      default:
        return '';
    }
  }

  /**
   * @type {string}
   */
  get symbol() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return 'BTC';
      case CryptocurrencyType.ltc:
        return 'LTC';
      case CryptocurrencyType.doge:
        return 'DOGE';
      case CryptocurrencyType.dash:
        return 'DASH';
      case CryptocurrencyType.eth:
        return 'ETH';
      case CryptocurrencyType.etc:
        return 'ETC';
      case CryptocurrencyType.xrp:
        return 'XRP';
      case CryptocurrencyType.bch:
        return 'BCH';
      default:
        return '';
    }
  }

  /**
   * @type {string}
   */
  get name() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return this._config.isTestnet ? 'Bitcoin Testnet' : 'Bitcoin';
      case CryptocurrencyType.ltc:
        return this._config.isTestnet ? 'Litecoin Testnet' : 'Litecoin';
      case CryptocurrencyType.doge:
        return this._config.isTestnet ? 'Dogecoin Testnet' : 'Dogecoin';
      case CryptocurrencyType.dash:
        return this._config.isTestnet ? 'Dash Testnet' : 'Dash';
      // case CryptocurrencyType.eth: return this._config.isTestnet ? "Ethereum Rinkeby" : "Ethereum";
      case CryptocurrencyType.eth:
        return this._config.isTestnet ? 'Ethereum Ropsten' : 'Ethereum';
      case CryptocurrencyType.etc:
        return this._config.isTestnet
          ? 'Ethereum Classic Mordor'
          : 'Ethereum Classic';
      case CryptocurrencyType.xrp:
        return this._config.isTestnet
          ? 'XRP Testnet'
          : 'XRPs';
      case CryptocurrencyType.bch:
        return this._config.isTestnet
          ? 'Bitcoin Cash Testnet'
          : 'Bitcoin Cash';
      default:
        return '';
    }
  }

  /**
   * @type {string}
   */
  get scheme() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return 'bitcoin';
      case CryptocurrencyType.ltc:
        return 'litecoin';
      case CryptocurrencyType.doge:
        return 'dogecoin';
      case CryptocurrencyType.dash:
        return 'dash';
      case CryptocurrencyType.eth:
        return 'ethereum';
      case CryptocurrencyType.etc:
        return 'ethereum';
      case CryptocurrencyType.xrp:
        return 'xrpl';
      case CryptocurrencyType.bch:
        return this._config.isTestnet ? 'bchtest' : 'bitcoincash';
      default:
        return '';
    }
  }

  /**
   * @type {number} - SECP256K1: 0, Curve25519: 1
   */
  get curveType() {
    // SECP256K1: 0
    // Curve25519: 1
    switch (this._type) {
      case CryptocurrencyType.btc:
        return 0;
      case CryptocurrencyType.ltc:
        return 0;
      case CryptocurrencyType.doge:
        return 0;
      case CryptocurrencyType.dash:
        return 0;
      case CryptocurrencyType.eth:
        return 0;
      case CryptocurrencyType.etc:
        return 0;
      case CryptocurrencyType.xrp:
        return 0; // XRP can support ed25519 as well
      case CryptocurrencyType.bch:
        return 0;
      default:
        return 0;
    }
  }

  /**
   * @type {number} 16 hex
   */
  get forkId() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return 0;
      case CryptocurrencyType.ltc:
        return 0;
      case CryptocurrencyType.doge:
        return 0;
      case CryptocurrencyType.dash:
        return 0;
      case CryptocurrencyType.eth:
        return 0;
      case CryptocurrencyType.etc:
        return 0;
      case CryptocurrencyType.xrp:
        return 0;
      case CryptocurrencyType.bch:
        return 0x40;
      default:
        return 0;
    }
  }

  /**
   * @type {string} 'mainnet' or 'testnet' or 'ropsten' or 'mordor'
   */
  get network() {
    if (!this._config.isTestnet) return 'mainnet';
    switch (this._type) {
      case CryptocurrencyType.btc:
      case CryptocurrencyType.ltc:
      case CryptocurrencyType.doge:
      case CryptocurrencyType.dash:
      case CryptocurrencyType.xrp:
      case CryptocurrencyType.bch:
        return 'testnet';
      case CryptocurrencyType.eth:
        return 'ropsten'; // ropsten, rinkeby
      case CryptocurrencyType.etc:
        return 'mordor';
      default:
        return '';
    }
  }

  /**
   * @type {number}
   */
  get chainId() {
    if (this._type !== CryptocurrencyType.eth && this._type !== CryptocurrencyType.etc) { this._logger.error('Not ETH nor ETC'); }
    switch (this.network) {
      case 'ropsten':
        return 3;
      case 'rinkeby':
        return 4;
      case 'mordor':
        return 63;
      case 'mainnet':
        return (this._type === CryptocurrencyType.eth) ? 1 : 61;
      default:
        return 0;
    }
  }

  /**
   * @type {number} 16 hex
   */
  get p2pkhAddressPrefix() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return this._config.isTestnet ? 0x6F : 0;
      case CryptocurrencyType.ltc:
        return this._config.isTestnet ? 0x6F : 0x30;
      case CryptocurrencyType.doge:
        return this._config.isTestnet ? 0x71 : 0x1E;
      case CryptocurrencyType.dash:
        return this._config.isTestnet ? 0x8C : 0x4C;
      case CryptocurrencyType.eth:
        return 0;
      case CryptocurrencyType.etc:
        return 0;
      case CryptocurrencyType.xrp:
        return 0;
      case CryptocurrencyType.bch:
        return this._config.isTestnet ? 0x6F : 0;
      default:
        return 0;
    }
  }

  /**
   * @type {number} 16 hex
   */
  get p2shAddressPrefix() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return this._config.isTestnet ? 0xC4 : 0x05;
      case CryptocurrencyType.ltc:
        return this._config.isTestnet ? 0x3A : 0x32;
      case CryptocurrencyType.doge:
        return this._config.isTestnet ? 0xC4 : 0x16;
      case CryptocurrencyType.dash:
        return this._config.isTestnet ? 0x13 : 0x10;
      case CryptocurrencyType.eth:
        return 0;
      case CryptocurrencyType.etc:
        return 0;
      case CryptocurrencyType.xrp:
        return 0;
      case CryptocurrencyType.bch:
        return this._config.isTestnet ? 0xC4 : 0x05;
      default:
        return 0;
    }
  }

  /**
   * @type {number} always return 0
   */
  get xrpLegacyAddressPrefix() {
    return 0;
  }

  static get xrpLegacyAddressPrefix() {
    return 0;
  }

  /**
   * @type {number} always return 0
   */
  get p2pkhCashAddrVersion() {
    if (this._type !== CryptocurrencyType.bch) this._logger.error('Not BCH');
    return 0;
  }

  /**
   * @type {number} always return 8
   */
  get p2shCashAddrVersion() {
    if (this._type !== CryptocurrencyType.bch) this._logger.error('Not BCH');
    return 8;
  }

  /**
   * @type {string} return "bchtest" or "bitcoincash"
   */
  get cashAddrHRP() {
    if (this._type !== CryptocurrencyType.bch) this._logger.error('Not BCH');
    return this._config.isTestnet ? 'bchtest' : 'bitcoincash';
  }

  /**
   * @type {string} return ("tb" or "bc") or ("tltc" or "ltc") or ""
   */
  get bech32HRP() {
    if (this._type !== CryptocurrencyType.btc && this._type !== CryptocurrencyType.ltc) { this._logger.error('[bech32HRP] Not BTC nor LTC'); }
    switch (this._type) {
      case CryptocurrencyType.btc:
        return this._config.isTestnet ? 'tb' : 'bc';
      case CryptocurrencyType.ltc:
        return this._config.isTestnet ? 'tltc' : 'ltc';
      default:
        return '';
    }
  }

  /**
   * @type {string} return "1" or ""
   */
  get bech32Separator() {
    if (this._type !== CryptocurrencyType.btc && this._type !== CryptocurrencyType.ltc) { this._logger.error('[bech32Separator] Not BTC nor LTC'); }
    switch (this._type) {
      case CryptocurrencyType.btc:
        return '1';
      case CryptocurrencyType.ltc:
        return '1';
      default:
        return '';
    }
  }

  /**
   * @type {boolean}
   */
  get isSegWitSupported() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return true;
      case CryptocurrencyType.ltc:
        return true;
      default:
        return false;
    }
  }

  /**
   * @type {string} crypto currency icon
   */
  get iconImgAddr() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return 'assets/images/Bitcoin@3x-2.png';
      case CryptocurrencyType.ltc:
        return 'assets/images/Litecoin@3x-2.png';
      case CryptocurrencyType.doge:
        return 'assets/images/DOGE_dark_mode@3x.png';
      case CryptocurrencyType.dash:
        return 'assets/images/DASH_dark_mode@3x.png';
      case CryptocurrencyType.eth:
        return 'assets/images/Ethereum@3x-2.png';
      case CryptocurrencyType.etc:
        return 'assets/images/Ethereum@3x-2.png';
      case CryptocurrencyType.xrp:
        return 'assets/images/Xrp_light.png';
      case CryptocurrencyType.bch:
        return 'assets/images/BitcoinCash@3x-2.png';
      default:
        return '';
    }
  }

  /**
   * @type {string} crypto currency big icon
   */
  get bgImgAddr() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return 'assets/images/BitcoinBg.png';
      case CryptocurrencyType.ltc:
        return 'assets/images/Litecoin.png';
      case CryptocurrencyType.doge:
        return 'assets/images/Dogecoin_dark_mode_512.png';
      case CryptocurrencyType.dash:
        return 'assets/images/DASH_dark_mode_512.png';
      case CryptocurrencyType.eth:
        return 'assets/images/EthereumBg.png';
      case CryptocurrencyType.etc:
        return 'assets/images/EthereumBg.png';
      case CryptocurrencyType.xrp:
        return 'assets/images/Xrp_light.png';
      case CryptocurrencyType.bch:
        return 'assets/images/BitcoinCashBg.png';
      default:
        return '';
    }
  }

  /**
   * @type {number}
   */
  get supportedPurpose() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return {
          [PBSegWitType.nonSegWit.name]: PBSegWitType.nonSegWit.purpose,
          [PBSegWitType.segWit.name]: PBSegWitType.segWit.purpose,
          [PBSegWitType.nativeSegWit.name]: PBSegWitType.nativeSegWit.purpose,
        };
      case CryptocurrencyType.ltc:
        return {
          [PBSegWitType.nonSegWit.name]: PBSegWitType.nonSegWit.purpose,
          [PBSegWitType.segWit.name]: PBSegWitType.segWit.purpose,
          [PBSegWitType.nativeSegWit.name]: PBSegWitType.nativeSegWit.purpose,
        };
      case CryptocurrencyType.doge:
        return { [PBSegWitType.nonSegWit.name]: PBSegWitType.nonSegWit.purpose };
      case CryptocurrencyType.dash:
        return { [PBSegWitType.nonSegWit.name]: PBSegWitType.nonSegWit.purpose };
      case CryptocurrencyType.eth:
        return { [PBSegWitType.nonSegWit.name]: PBSegWitType.nonSegWit.purpose };
      case CryptocurrencyType.etc:
        return { [PBSegWitType.nonSegWit.name]: PBSegWitType.nonSegWit.purpose };
      case CryptocurrencyType.xrp:
        return { [PBSegWitType.nonSegWit.name]: PBSegWitType.nonSegWit.purpose };
      case CryptocurrencyType.bch:
        return { [PBSegWitType.nonSegWit.name]: PBSegWitType.nonSegWit.purpose };
      default:
        return {};
    }
  }

  /**
   * @type {number}
   */
  get lowFeePerByte() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return this._config.isTestnet ? 30 : 126;
      case CryptocurrencyType.ltc:
        return this._config.isTestnet ? 10 : 68;
      case CryptocurrencyType.doge:
        return this._config.isTestnet ? 301205 : 150206;
      case CryptocurrencyType.dash:
        return this._config.isTestnet ? 1 : 16;
      case CryptocurrencyType.eth:
        return 0;
      case CryptocurrencyType.etc:
        return 0;
      case CryptocurrencyType.xrp:
        return 0;
      case CryptocurrencyType.bch:
        return this._config.isTestnet ? 2 : 12;
      default:
        return 0;
    }
  }

  /**
   * @type {number}
   */
  get mediumFeePerByte() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return this._config.isTestnet ? 121 : 252;
      case CryptocurrencyType.ltc:
        return this._config.isTestnet ? 26 : 153;
      case CryptocurrencyType.doge:
        return this._config.isTestnet ? 301205 : 278012;
      case CryptocurrencyType.dash:
        return this._config.isTestnet ? 1 : 62;
      case CryptocurrencyType.eth:
        return 0;
      case CryptocurrencyType.etc:
        return 0;
      case CryptocurrencyType.xrp:
        return 0;
      case CryptocurrencyType.bch:
        return this._config.isTestnet ? 8 : 32;
      default:
        return 0;
    }
  }

  /**
   * @type {number}
   */
  get highFeePerByte() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return this._config.isTestnet ? 144 : 388;
      case CryptocurrencyType.ltc:
        return this._config.isTestnet ? 99 : 448;
      case CryptocurrencyType.doge:
        return this._config.isTestnet ? 301205 : 592622;
      case CryptocurrencyType.dash:
        return this._config.isTestnet ? 8 : 107;
      case CryptocurrencyType.eth:
        return 0;
      case CryptocurrencyType.etc:
        return 0;
      case CryptocurrencyType.xrp:
        return 0;
      case CryptocurrencyType.bch:
        return this._config.isTestnet ? 22 : 118;
      default:
        return 0;
    }
  }

  /**
   * @type {string}
   */
  get lowGasPrice() {
    const oneGwei = 1000000000;
    let gwei = 0.0;
    switch (this._type) {
      case CryptocurrencyType.eth:
        gwei = this._config.isTestnet ? 4 : 45;
        break;
      case CryptocurrencyType.etc:
        gwei = this._config.isTestnet ? 16 : 1;
        break;
      default:
        break;
    }
    return new BigNumber(gwei).multipliedBy(new BigNumber(oneGwei)).toFixed();
  }

  /**
   * @type {string}
   */
  get mediumGasPrice() {
    const oneGwei = 1000000000;
    let gwei = 0.0;
    switch (this._type) {
      case CryptocurrencyType.eth:
        gwei = this._config.isTestnet ? 9 : 55;
        break;
      case CryptocurrencyType.etc:
        gwei = this._config.isTestnet ? 33 : 2;
        break;
      default:
        break;
    }
    return new BigNumber(gwei).multipliedBy(new BigNumber(oneGwei)).toFixed();
  }

  /**
   * @type {string}
   */
  get highGasPrice() {
    const oneGwei = 1000000000;
    let gwei = 0.0;
    switch (this._type) {
      case CryptocurrencyType.eth:
        gwei = this._config.isTestnet ? 49 : 85;
        break;
      case CryptocurrencyType.etc:
        gwei = this._config.isTestnet ? 50 : 4;
        break;
      default:
        break;
    }
    return new BigNumber(gwei).multipliedBy(new BigNumber(oneGwei)).toFixed();
  }

  /**
   * @type {string}
   */
  get caUrlCoinType() {
    switch (this._type) {
      case CryptocurrencyType.btc: return 'btc';
      case CryptocurrencyType.ltc: return 'ltc';
      case CryptocurrencyType.doge: return 'doge';
      case CryptocurrencyType.dash: return 'dash';
      case CryptocurrencyType.eth: return 'eth';
      case CryptocurrencyType.etc: return 'etc';
      case CryptocurrencyType.xrp: return 'xrp';
      case CryptocurrencyType.bch: return 'bch';
      default:
        return '';
    }
  }

  /**
   * @type {string}
   */
  get caUrlNetworkType() {
    if (!this._config.isTestnet) return 'mainnet';
    switch (this._type) {
      case CryptocurrencyType.btc:
      case CryptocurrencyType.ltc:
      case CryptocurrencyType.doge:
      case CryptocurrencyType.dash:
      case CryptocurrencyType.xrp:
      case CryptocurrencyType.bch: return 'testnet';
      case CryptocurrencyType.eth: return 'ropsten'; // ropsten, rinkeby
      case CryptocurrencyType.etc: return 'mordor';
      default:
        return '';
    }
  }

  /**
   * @type {number}
   */
  get averageConfirmationTime() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return 10 * 60;
      case CryptocurrencyType.ltc:
        return Math.round(2.5 * 60);
      case CryptocurrencyType.doge:
        return 1 * 60;
      case CryptocurrencyType.dash:
        return Math.round(2.5 * 60);
      case CryptocurrencyType.eth:
        return 0;
      case CryptocurrencyType.etc:
        return 0;
      case CryptocurrencyType.xrp:
        return 0;
      case CryptocurrencyType.bch:
        return 9 * 60;
      default:
        return 10 * 60;
    }
  }

  /**
   * @type {number}
   */
  get fullSyncInterval() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return 8 * 60 * 60 * 1000;
      case CryptocurrencyType.ltc:
        return 8 * 60 * 60 * 1000;
      case CryptocurrencyType.doge:
        return 8 * 60 * 60 * 1000;
      case CryptocurrencyType.dash:
        return 8 * 60 * 60 * 1000;
      case CryptocurrencyType.eth:
        return 60 * 1000;
      case CryptocurrencyType.etc:
        return 60 * 1000;
      case CryptocurrencyType.xrp:
        return 30 * 1000;
      case CryptocurrencyType.bch:
        return 8 * 60 * 60 * 1000;
      default:
        return 8 * 60 * 60 * 1000;
    }
  }

  /**
   * @type {number}
   */
  get partialSyncInterval() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return Math.floor(this.averageConfirmationTime / 2) * 1000;
      case CryptocurrencyType.ltc:
        return Math.round(2.5 * 60) * 1000;
      case CryptocurrencyType.doge:
        return Math.round(2.5 * 60) * 1000;
      case CryptocurrencyType.dash:
        return Math.round(2.5 * 60) * 1000;
      case CryptocurrencyType.eth:
        return 0;
      case CryptocurrencyType.etc:
        return 0;
      case CryptocurrencyType.xrp:
        return 0;
      case CryptocurrencyType.bch:
        return Math.floor(this.averageConfirmationTime / 2) * 1000;
      default:
        return Math.floor(this.averageConfirmationTime / 2) * 1000;
    }
  }

  /**
   * @type {string}
   */
  get apiKey() {
    switch (this._type) {
      case CryptocurrencyType.btc:
        return this._config.cryptoApiKeyForBTC;
      case CryptocurrencyType.ltc:
        return this._config.cryptoApiKeyForLTC;
      case CryptocurrencyType.doge:
        return this._config.cryptoApiKeyForDOGE;
      case CryptocurrencyType.dash:
        return this._config.cryptoApiKeyForDASH;
      case CryptocurrencyType.eth:
        return this._config.cryptoApiKeyForETH;
      case CryptocurrencyType.etc:
        return this._config.cryptoApiKeyForETC;
      case CryptocurrencyType.xrp:
        return this._config.cryptoApiKeyForXRP;
      case CryptocurrencyType.bch:
        return this._config.cryptoApiKeyForBCH;
      default:
        return '';
    }
  }
}

module.exports = PBCryptocurrencyType;
