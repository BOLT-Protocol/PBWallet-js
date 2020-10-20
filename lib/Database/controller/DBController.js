const DB = require('./Database');

let dbInstance;

/**
 * Expose `DBController` class.
 */
class DBController {
  /**
   * @param {string} CHAIN_ENV - CHAIN_ENV config
   * @param {eventEmitter} eventEmitter - event emitter
   */
  constructor({ CHAIN_ENV = '', eventEmitter }) {
    this.CHAIN_ENV = CHAIN_ENV;
    this._database = null;
    this.em = eventEmitter;
  }

  /**
   * DB init function, return db instance & db operator
   */
  init() {
    return new DB(this.CHAIN_ENV)
      .then((db) => this.register(db))
      .catch(); // TODO: error handle throw eventEmitter event
  }

  /**
   * DB operator
   */
  register(db) {
    this._database = db;
    return {
      /**
       * insert one row data to table
       * @param {string} tableName - db table name
       * @param {Object} valueObj - insert table json object { 'column name': value }
       */
      insert: async (tableName, valueObj = {}) => {
        const sql = `
          INSERT OR REPLACE INTO ${tableName} (${Object.keys(valueObj).join(', ')})
          VALUES (${Object.keys(valueObj).map(() => '?').join(', ')})
        `;
        this._database.run(sql, Object.values(valueObj));
      },
      /**
       * fetch one row where valueObj from table
       * @param {string} tableName - db table name
       * @param {Object} valueObj - insert table json object { 'column name': value }
       */
      fetchOne: async (tableName, { where, whereArgs = [] }) => {
        const findOneTxID = `
          SELECT * FROM ${tableName} WHERE ${where}
        `;
        if (this._isStopped) return {};
        return this._database.get(findOneTxID, whereArgs);
      },
      /**
       * fetch all row where valueObj from table
       * @param {string} tableName - db table name
       * @param {Object} valueObj - insert table json object { 'column name': value }
       */
      fetchAll: async (tableName, { where = '', whereArgs = [], order = '' }) => {
        const findOneTxID = `
          SELECT * FROM ${tableName} ${(where.length > 0) ? `WHERE ${where}` : ''} ${order}
        `;
        if (this._isStopped) return [];
        return this._database.all(findOneTxID, whereArgs);
      },
      /**
       * delete all row where valueObj from table
       * @param {string} tableName - db table name
       * @param {Object} valueObj - insert table json object { 'column name': value }
       */
      deleteAll: async (tableName, { where = '', whereArgs = [] }) => {
        if (where == null) return this._database.runDB(`DELETE FROM ${tableName}`);

        return this._database.all(
          `DELETE FROM ${tableName} WHERE ${where}`,
          whereArgs,
        );
      },
    };
  }
}

const newInstance = ({ CHAIN_ENV, eventEmitter }) => {
  if (!CHAIN_ENV || !eventEmitter) return dbInstance.init();
  if (typeof dbInstance === 'object') {
    return dbInstance;
  }

  dbInstance = new DBController({ CHAIN_ENV, eventEmitter });
  return dbInstance.init();
};

module.exports = newInstance;
