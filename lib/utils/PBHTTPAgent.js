const axios = require('axios');
const PBLog = require('../PBLog');

const _defaultHeaders = { 'content-type': 'application/json' };
const METHOD_GET = 'GET';
const METHOD_POST = 'POST';
const METHOD_PUT = 'PUT';
const METHOD_DELETE = 'DELETE';
const _defaultRetryCount = 1;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** PBHTTPAgent Class */
class PBHTTPAgent {
  /**
   * http agent
   * @async
   * @param {Object} requestObj
   * @param {string} requestObj.url - http request url
   * @param {string} requestObj.type - http request method
   * @param {string} requestObj.payload - http request body
   * @param {string} requestObj.headers - http request headers(default: { 'Content-Type': 'application/json' } )
   * @param {string} requestObj.responseType - http response data type(options are: 'arraybuffer', 'document', 'json', 'text', 'stream', default: 'json' )
   * @param {number} requestObj.retryCount - http request retryCount(default only request OfflineAudioCompletionEvent, no retry)
   * @return {number} responseType promise
   */
  async request({
    url = '', type = METHOD_GET, payload = {}, headers, responseType = 'json', retryCount = _defaultRetryCount,
  }) {
    const originCount = retryCount;
    let resultPayload = null;
    let meta = null;
    let data = null;
    for (let i = 0; i < retryCount; i++) {
      if (retryCount < originCount - 1) {
        PBLog.error('Agent retry', retryCount, url);
      }
      const method = (type !== METHOD_GET
        && type !== METHOD_POST
        && type !== METHOD_PUT
        && type !== METHOD_DELETE
      ) ? type : METHOD_GET;

      let response = null;
      try {
        response = await axios({
          method,
          url,
          headers: (headers) ? { ...headers, 'Content-Type': 'application/json' } : _defaultHeaders,
          data: payload,
          responseType,
        });
      } catch (error) {
        PBLog.error(error);
        PBLog.error(error.message);
        if (error.response && error.response.data) {
          PBLog.error(error.response.data.meta);
          meta = error.response.data.meta;
        }
      }

      if (response && response.status === 200) {
        resultPayload = response.data.payload;
        meta = (meta) || response.data.meta || {};
        data = response.data;
        let seconds = 1;

        if (meta.code !== 63 && resultPayload != null) break;

        // request limit reached
        seconds += Math.floor(Math.random() * 10);
        sleep(seconds * 1000);
      }
      sleep(1000);
    }

    // [payload, meta]
    return { payload: resultPayload, meta, data };
  }
}

let instance;
if (typeof instance !== 'object') {
  instance = new PBHTTPAgent();
}

module.exports = instance;
