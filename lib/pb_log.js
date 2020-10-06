const log4js = require('log4js');
const { LOG = false, DEBUG_LEVEL = false } = require('../env');

const logger = log4js.getLogger('PB_Wallet');
logger.level = 'debug';

const pbLog = {};
const enableLog = LOG;
const enableDebug = enableLog && DEBUG_LEVEL;

pbLog.debug = (...args) => {
  if (enableDebug) { logger.debug(...args); }
};

pbLog.info = (...args) => {
  if (enableLog) { logger.info(...args); }
};

pbLog.warning = (...args) => {
  if (enableLog) { logger.warn(...args); }
};

pbLog.error = (...args) => {
  if (enableLog) { logger.error(...args); }
};

module.exports = pbLog;
