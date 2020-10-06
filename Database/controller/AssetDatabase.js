class AssetDatabase {
  constructor(db) {
    this.db = db;
  }

  // assetId:"CNY"
  // cryptoType:false
  // name:"Yuan Renminbi"
  // originalSymbol:"CNY"
  // _id:"5b1ea92e584bf50020130613"

  // assetId:"BTC"
  // cryptoType:true
  // name:"Bitcoin"
  // originalSymbol:"BTC"
  // _id:"5b1ea92e584bf50020130612"

  createTable() {
    const assetSQL = `
      CREATE TABLE IF NOT EXISTS asset (
        _id TEXT PRIMARY KEY,
        assetId TEXT,
        cryptoType BOOLEAN,
        name TEXT,
        originalSymbol TEXT
      )`;

    const assetFetchTimeSQL = `
      CREATE TABLE IF NOT EXISTS asset_fetch_time (
        id TEXT PRIMARY KEY,
        updatTime DATE
      )`;

    return this.db.runDB(assetSQL).then(() => this.db.runDB(assetFetchTimeSQL));
  }

  updateAssetFetchCatchTimestamp() {
    const sql = `
      INSERT OR REPLACE INTO asset_fetch_time (id, updatTime)
      VALUES (?, ?)
    `;

    const updatTime = new Date();
    return this.db.runDB(sql, ['assetFetchTime', updatTime]);
  }

  getAssetFetchCatchTimestamp() {
    const sql = `
      SELECT updatTime FROM asset_fetch_time WHERE id = ?
    `;

    return this.db.get(sql, ['assetFetchTime']);
  }

  updateAsset(_id, assetId, cryptoType, name, originalSymbol) {
    const sql = `
      INSERT OR REPLACE INTO asset (_id, assetId, cryptoType, name, originalSymbol)
      VALUES (?, ?, ?, ?, ?)
    `;

    return this.db.runDB(sql, [_id, assetId, cryptoType, name, originalSymbol]);
  }

  getAllryptoAsset(cryptoType) {
    const sql = `
      SELECT * FROM asset WHERE cryptoType = ?
    `;

    return this.db.all(sql, [cryptoType]);
  }
}

module.exports = AssetDatabase;
