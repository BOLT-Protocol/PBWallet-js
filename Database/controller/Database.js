const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const { CHAIN_ENV } = require('../../env');

const DBFILE = `ATDatabase-${CHAIN_ENV}.db`;

class Database {
  constructor(App, name = '') {
    this.db = null;
    const DBName = name || DBFILE;
    const dbPath = process.env.NODE_ENV === 'development' ? path.join(`${__dirname}`, '../db/', `${DBName}`) : path.resolve(App.getPath('userData'), DBName);
    this.db = new sqlite3.Database(dbPath);
  }

  init() {

  }

  runDB(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.log(`Error running sql ${sql}`);
          console.log(err);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.log(`Error running sql: ${sql}`);
          console.log(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.log(`Error running sql: ${sql}`);
          console.log(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  update() {

  }

  delete() {

  }

  close() {
    this.db.close();
  }
}

module.exports = Database;
