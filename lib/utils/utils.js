const fs = require('fs');
const os = require('os');
const toml = require('toml');
const path = require('path');

const defaultConfigFolder = `${os.homedir()}/.pbwallet`;

/**
 * Expose `Utils` class.
 * @class
 */
class Utils {
  static initialPath(initPath) {
    if (!initPath) {
      return Promise.reject(new Error('folder path is undefined'));
    }
    return new Promise((resolve, reject) => {
      fs.stat(initPath, (err) => {
        if (err && err.code === 'ENOENT') {
          fs.mkdir(initPath, (e) => {
            if (e) {
              reject(e);
            } else {
              resolve(initPath);
            }
          });
        } else {
          resolve(initPath);
        }
      });
    });
  }

  static randomStr(length = 64) {
    let key = '';
    const charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++) { key += charset.charAt(Math.floor(Math.random() * charset.length)); }
    return key;
  }

  static readFile({ filePath, config = {} }) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, config, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  static async _initConfig() {
    const filePath = `${defaultConfigFolder}/env.toml`;
    try {
      await fs.statSync(filePath);
    } catch (e) {
      const defaultFilePath = path.resolve(__dirname, './../../env.example.toml');
      await this.initialPath(defaultConfigFolder);
      await fs.copyFileSync(defaultFilePath, filePath);
    }
    const tomlConfig = await Utils.readFile({ filePath });

    try {
      return toml.parse(tomlConfig);
    } catch (e) {
      throw new Error(`Invalid config file: ${filePath}`);
    }
  }
}

module.exports = Utils;
