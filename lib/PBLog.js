const log4js = require('log4js');

const logger = log4js.getLogger('PB_Wallet');
logger.level = 'debug';

class PBLog {
  constructor(config = {}) {
    const { LOG = false, DEBUG_LEVEL = false } = config;
    this.enableLog = LOG || true;
    this.enableDebug = this.enableLog && DEBUG_LEVEL;
  }

  debug(...args) {
    if (this.enableDebug) { logger.debug(...args); }
  }

  info(...args) {
    if (this.enableLog) { logger.info(...args); }
  }

  warning(...args) {
    if (this.enableLog) { logger.warn(...args); }
  }

  error(...args) {
    if (this.enableLog) { logger.error(...args); }
  }
}

module.exports = PBLog;
