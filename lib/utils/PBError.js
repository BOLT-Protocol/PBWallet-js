/**
 * PBError - error msg
 * @type {string}
 * @const
 */
const PBError = {
  success: 'success',
  failure: 'failure',
  bleUnavailable: 'bleUnavailable',
  bleOff: 'bleOff',
  invalidParameter: 'invalidParameter',
  unsupportedFunction: 'unsupportedFunction',
  deviceNotFound: 'deviceNotFound',
  serviceNotFound: 'serviceNotFound',
  characteristicNotFound: 'characteristicNotFound',
  incorrectSW: 'incorrectSW',
  failedToCreateSession: 'failedToCreateSession',
  needsFpLogin: 'needsFpLogin',
  cmdCancelled: 'cmdCancelled',
  failedToLogin: 'failedToLogin',
  timeout: 'timeout',
  failedToDecode: 'failedToDecode',
  invalidResponse: 'invalidResponse',
  dataSizeTooLong: 'dataSizeTooLong',
  noConnectedDevice: 'noConnectedDevice',
  stopScaned: 'stopScaned',
};

module.exports = PBError;
