const DB = require('./Database');

let dbInstance;

class DBController {
  constructor({ config = {}, eventEmitter }) {
    this.CHAIN_ENV = config.CHAIN_ENV || '';
    this.DB = null;
    this.em = eventEmitter;

    this.assetTable = null;
  }

  init() {
    new DB(this.CHAIN_ENV)
      .then(() => this.register())
      .catch(); // TODO: error handle
  }

  register() {
  }
}

const newInstance = ({ config, eventEmitter }) => {
  if (!config || !eventEmitter) return dbInstance.init();
  if (typeof dbInstance === 'object') {
    return dbInstance;
  }

  dbInstance = new DBController({ config, eventEmitter });
  return dbInstance.init();
};

module.exports = newInstance;
