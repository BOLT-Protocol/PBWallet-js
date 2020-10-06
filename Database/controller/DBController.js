const ipc = require('electron').ipcMain;
const axios = require('axios');
const DB = require('./Database');
const ASSETDB = require('./AssetDatabase');
const atLog = require('../ATWalletKit/at_log');

let dbInstance;

const { API_ENDPOINT, APIKEY } = require('../../env');

const getCryptoUri = `/v1/assets/meta?limit=${100}&type=${'crypto'}`;
const getFiatUri = `/v1/assets/meta?limit=${77}&type=${'fiat'}`;

const addUUID = (uri) => {
  if (!this.uuid) return '';
  if (uri.indexOf('?') > -1) {
    return `&uid=${this.uuid}`;
  }
  return `?uid=${this.uuid}`;
};

const getAssets = async (uri) => axios({
  method: 'GET',
  url: `${API_ENDPOINT}${uri}${addUUID(uri)}`,
  headers: { 'X-API-Key': APIKEY, 'Content-Type': 'application/json' },
  data: {},
}).then((res) => {
  if (res.data) {
    const result = { ...res.data };

    if (!result.payload) {
      // API ERROR
      return {
        payload: [],
        meta: {
          totalCount: 0, index: 0, limit: 50, results: 0,
        },
        success: false,
      };
    }
    result.data = result.payload;
    result.success = true;
    delete result.payload;

    return result;
  }
  // API ERROR
  return {
    payload: [],
    meta: {
      totalCount: 0, index: 0, limit: 50, results: 0,
    },
    success: false,
  };
});

class DBController {
  constructor(App) {
    this.App = App;
    this.DB = new DB(App);
    this.window = null;
    this.TxDB = new TXDB(this.DB);
    this.UTXODB = new UTXODB(this.DB);
    this.APPDB = new AppInforDB(this.DB);
    this.AssetDB = new ASSETDB(this.DB);
  }

  createDB(name) {
    return new DB(this.App, name);
  }

  init(window) {
    this.window = window;

    return this.TxDB.createTable()
      .then(() => this.UTXODB.createTable())
      .then(() => this.APPDB.createTable())
      .then(() => this.AssetDB.createTable())
      .then(() => {
        atLog.debug('Create All Table Success');
        return Promise.resolve(true);
      })
      .catch((e) => {
        atLog.debug('Create Fail', e);
        return Promise.resolve(false);
      })
      .then((result) => {
        if (result) {
          return this.register();
        }
        return Promise.resolve();
      });
  }

  register() {
    /**
    * []
    * @param Event e
    * @param Tx[]  args  transaction array [{ hash, from, to, value, currency, timestamp, owner }]
    */

    ipc.on('GET_ASSETS', () => {
      this.AssetDB.getAssetFetchCatchTimestamp()
        .then((rs = {}) => {
          const { updatTime = 0 } = rs;
          const nowTime = new Date();
          const expiredTime = Math.floor(nowTime) - 24 * 60 * 60 * 1000;

          if (updatTime && updatTime > expiredTime) {
            atLog.debug('GET_ASSETS find by catch');

            Promise.all([this.AssetDB.getAllryptoAsset(false), this.AssetDB.getAllryptoAsset(true)])
              .then(([fiatsData, assetsData]) => {
                this.window.send('GET_ASSETS', { success: true, fiatsData, assetsData });
              })
              .catch((e) => {
                atLog.debug('GET_ASSETS error:', e);
                this.window.send('GET_ASSETS', { success: false, fiatsData: [], assetsData: [] });
              });
          } else {
            atLog.debug('GET_ASSETS catch timeout, update assetList');
            // catch timeout, update assetList
            Promise.all([
              this.AssetDB.updateAssetFetchCatchTimestamp(),
              getAssets(getFiatUri),
              getAssets(getCryptoUri),
            ])
              .then(([updateCatch, fiatsResponse, asssetsResponse]) => {
                if (!updateCatch.id) {
                // update catch error, retry again
                  atLog.debug('update catch error, retry again!!!!!');
                  this.AssetDB.updateAssetFetchCatchTimestamp();
                }
                const fiatsData = fiatsResponse.data;
                const assetsData = asssetsResponse.data;
                const assets = fiatsData.concat(assetsData);
                // write in db
                Promise.all(assets.map((item) => this.AssetDB.updateAsset(item._id, item.assetId, item.cryptoType, item.name, item.originalSymbol)))
                  .then((res) => {
                    atLog.debug('updateAsset Success');
                    this.window.send('GET_ASSETS', { success: true, fiatsData, assetsData });
                  })
                  .catch((e) => {
                    atLog.debug('updateAsset Fail');
                    this.window.send('GET_ASSETS', { success: false, fiatsData: [], assetsData: [] });
                  });
              })
              .catch((e) => {
                atLog.debug('GET_ASSETS error:', e);
                this.window.send('GET_ASSETS', { success: false, fiatsData: [], assetsData: [] });
              });
          }
        })
        .catch((e) => {
          atLog.debug('GET_ASSETS find assetFeth catch time error:', e);
          this.window.send('GET_ASSETS', { success: false });
        });
    });

    ipc.on('UPDATE_TX', (e, args) => {
      Promise.all(args.map((tx) => this.TxDB.insert(tx)))
        .then((res) => {
          atLog.debug('Insert Success');
        })
        .catch((e) => {
          atLog.debug('Insert Fail');
        });
    });

    ipc.on('UPDATE_RATE', (e, { baseAsset, quoteAsset, weightedAveragePrice }) => {
      this.TxDB.updateRate(baseAsset, quoteAsset, weightedAveragePrice)
        .then((data) => {
          this.window.send('UPDATE_RATE', { success: true });
        })
        .catch((e) => {
          this.window.send('UPDATE_RATE', { success: false });
        });
    });

    ipc.on('UPDATE_WALLET_ACCOUNT_ADDRESS', (e, {
      uuid, purpose, deviceId, address0, addressLast,
    }) => {
      this.TxDB.updateWalletAcountAddress(uuid, purpose, deviceId, address0, addressLast)
        .then((data) => {
          this.window.send('UPDATE_WALLET_ACCOUNT_ADDRESS', { success: true });
        })
        .catch((e) => {
          this.window.send('UPDATE_WALLET_ACCOUNT_ADDRESS', { success: false });
        });
    });

    ipc.on('GET_ADDRESS_BY_WALLET_INFO', (e, { uuid, purpose, deviceId }) => {
      this.TxDB.getAddresByWalletInfo(uuid, purpose, deviceId)
        .then((data) => {
          if (data) {
            this.window.send('GET_ADDRESS_BY_WALLET_INFO', { success: true, data });
          } else {
            this.window.send('GET_ADDRESS_BY_WALLET_INFO', { success: false });
          }
        })
        .catch((e) => {
          this.window.send('GET_ADDRESS_BY_WALLET_INFO', { success: false });
        });
    });

    ipc.on('GET_RATE', (e, {
      baseAsset, quoteAsset, targetCurrency, isToken, tokenIndex,
    }) => {
      this.TxDB.getRate(baseAsset, quoteAsset)
        .then((data) => {
          const nowTime = new Date();
          const expiredTime = Math.floor(nowTime) - 2 * 60 * 60 * 1000;
          if (data && data.updatTime > expiredTime) {
            this.window.send('GET_RATE', {
              success: true, weightedAveragePrice: data.weightedAveragePrice, baseAsset, quoteAsset, targetCurrency, isToken, tokenIndex,
            });
          } else {
          // catch timeout
            this.window.send('GET_RATE', {
              success: false, weightedAveragePrice: 0, baseAsset, quoteAsset, targetCurrency, isToken, tokenIndex,
            });
          }
        })
        .catch((e) => {
          this.window.send('GET_RATE', {
            success: false, weightedAveragePrice: 0, baseAsset, quoteAsset, targetCurrency, isToken, tokenIndex,
          });
        });
    });

    ipc.on('GET_DB_TX', (e, { currency, walletAddress }) => {
      this.TxDB.getAllByCurrency(currency, walletAddress)
        .then((rows) => {
          rows.forEach((tx) => {
            tx.from = tx.from_address;
            tx.to = tx.to_address;
            tx.hash = tx.id;

            delete tx.from_address;
            delete tx.to_address;
            delete tx.id;
          });

          this.window.send('GET_DB_TX', rows);
        });
    });

    ipc.on('UPDATE_UTXO', (e, args) => {
      Promise.all(args.map((utxoPayload) => this.UTXODB.insertUnspend(utxoPayload)))
        .then(() => {
          atLog.debug('UPDATE_UTXO Success');
          this.window.send('UPDATE_UTXO', { success: true });
        })
        .catch((e) => {
          atLog.debug('UPDATE_UTXO Fail');
          this.window.send('UPDATE_UTXO', { success: false });
        });
    });

    ipc.on('GET_UTXO', ({　uuid, deviceId, change　}) => {
      this.UTXODB.getUnspend({ uuid, deviceId, change })
        .then((row) => {
          this.window.send('GET_UTXO', { success: true, data: row });
        })
        .catch((e) => {
          this.window.send('GET_UTXO', { success: false });
        });
    });

    ipc.on('GET_UUID', () => {
      this.APPDB.getUUID()
        .then((row) => {
          this.window.send('GET_UUID', { success: true, data: row.id });
        })
        .catch((e) => {
          this.window.send('GET_UUID', { success: false });
        });
    });

    ipc.on('UPDATE_CURRENT_ASSET', (e, { id, asset_symbol }) => {
      this.APPDB.updateAsset(id, asset_symbol)
        .then((row) => {
          this.window.send('UPDATE_CURRENT_ASSET', { success: true });
        })
        .catch((e) => {
          this.window.send('UPDATE_CURRENT_ASSET', { success: false });
        });
    });

    ipc.on('GET_CURRENT_ASSET', (e, { id }) => {
      this.APPDB.getAsset(id)
        .then((row) => {
          this.window.send('GET_CURRENT_ASSET', { success: true, asset_symbol: row.asset_symbol });
        })
        .catch((e) => {
          this.window.send('GET_CURRENT_ASSET', { success: false });
        });
    });

    return Promise.resolve(true);
  }
}

const newInstance = (app) => {
  if (!app) return dbInstance;
  if (typeof dbInstance === 'object') {
    return dbInstance;
  }

  dbInstance = new DBController(app);
  return dbInstance;
};

module.exports = newInstance;
