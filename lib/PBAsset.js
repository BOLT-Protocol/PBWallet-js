const PBHTTPAgent = require('./utils/PBHTTPAgent');

class PBAsset {
  constructor(config, dbController) {
    this._config = config;
    this._dbController = dbController;
  }

  async init() {
    const nowTime = new Date();
    const updateTime = Math.floor(nowTime) - 24 * 60 * 60 * 1000;
    const time = this._config.device.last_asset_sync_time || 0;
    if (time && updateTime > time) {
      this.syncAsset();
    }
  }

  async syncAsset(skip = 0) {
    if (!this._config.API_KEY) return;
    let assetsCount = 0;
    const limit = 10000;
    const url = `https://api.cryptoapis.io/v1/assets/meta?skip=${skip}&limit=${limit}${(this._config._uniqueId != null) ? `&uid=${this._config._uniqueId}` : ''}`;

    const res = await PBHTTPAgent.request({ url, headers: { 'X-API-Key': this._config.API_KEY } });
    const { meta, payload } = res;

    const { totalCount, results } = meta;
    if (assetsCount === 0) {
      assetsCount = totalCount;
      await this._dbController.update('device', { valueObj: { last_asset_sync_time: Math.floor(new Date()) }, where: 'id = ?', whereArgs: [this._config.device.id] });
    }
    for (let i = 0; i < payload.length; i++) {
      const {
        _id: id, name, originalSymbol, cryptoType,
      } = payload[i];
      await this._dbController.insertOrUpdate('currency', {
        valueObj: {
          id,
          network: this._config.CHAIN_ENV === 'mainnet' ? 0 : 1,
          currency_type: cryptoType ? 1 : 0,
          currency_name: name,
          symbol: originalSymbol,
          exchange_rate: 0,
          currency_timestamp: Math.floor(new Date()),
        },
        where: 'id = ?',
        whereArgs: [id],
      });
    }
    if (totalCount < limit) return;
    if ((Number(results)) > 0) this._syncAsset(results);
  }
}

let assetInstance;

const newInstance = (config, dbController) => {
  if (typeof assetInstance === 'object') {
    return assetInstance;
  }

  assetInstance = new PBAsset(config, dbController);
  return assetInstance.init();
};

module.exports = newInstance;
