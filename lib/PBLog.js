const log4js = require('log4js');

const os = require('os');

const defaultConfigFolder = `${os.homedir()}/.pbwallet`;

class PBLog {
  constructor(config = {}) {
    const { LOG = false, DEBUG_LEVEL = false } = config;
    this.enableLog = LOG || true;
    this.enableDebug = this.enableLog && DEBUG_LEVEL;

    let level = 'error';
    const appenders = ['file'];
    if (this.enableDebug) {
      level = 'debug';
    }

    if (this.enableLog) {
      appenders.push('out');
    }
    log4js.configure({
      appenders: {
        file: {
          type: 'file',
          filename: `${defaultConfigFolder}/log.log`,
          maxLogSize: 10 * 1024 * 1024,
          backups: 5,
          compress: true,
        },
        out: {
          type: 'stdout',
        },
      },
      categories: {
        default: { appenders, level },
      },
    });
    this.logger = log4js.getLogger('PB_Wallet');
  }

  debug(...args) {
    if (this.enableDebug) { this.logger.debug(...args); }
  }

  info(...args) {
    if (this.enableLog) { this.logger.info(...args); }
  }

  warning(...args) {
    if (this.enableLog) { this.logger.warn(...args); }
  }

  error(...args) {
    if (this.enableLog) { this.logger.error(...args); }
  }
}

module.exports = PBLog;
