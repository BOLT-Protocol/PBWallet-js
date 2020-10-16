const path = require('path');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

class Database {
  constructor(CHAIN_ENV = 'mainnet') {
    this.db = null;
    const DBName = `PBDatabase-${CHAIN_ENV}.db`;
    const dbPath = path.join(`${__dirname}`, '../');
    const filename = `${dbPath}${DBName}`;

    return sqlite.open({
      filename,
      driver: sqlite3.Database,
    })
      .then(async (db) => {
        await db.migrate({
          migrationsPath: `${dbPath}/migrations`,
        });
        return db;
      })
      .catch(); // TODO: error handle
  }
}

module.exports = Database;
