class PBHdwAccountInfo {
  constructor(
    purpose, coinType, account, timestamp, name, cryptocurrencyType, uid, accountIndex,
    balance, numberOfUsedExternalKey, numberOfUsedInternalKey, createSpecificAccount = false,
  ) {
    this._purpose = purpose;
    this._coinType = coinType;
    this._account = account;
    this._timestamp = timestamp;
    this._name = name;
    this._createSpecificAccount = createSpecificAccount;
    this._cryptocurrenctType = cryptocurrencyType;
    this._uid = uid;
    this._accountIndex = accountIndex;
    this._balance = balance;
    this._numberOfUsedExternalKey = numberOfUsedExternalKey;
    this._numberOfUsedInternalKey = numberOfUsedInternalKey;
  }

  get purpose() { return this._purpose; }

  get coinType() { return this._coinType; }

  get account() { return this._account; }

  get timestamp() { return this._timestamp; }

  get name() { return this._name; }

  get cryptocurrencyType() { return this._cryptocurrenctType; }

  get uid() { return this._uid; }

  get accountIndex() { return this._accountIndex; }

  get balance() { return this._balance; }

  get numberOfUsedExternalKey() { return this._numberOfUsedExternalKey; }

  get numberOfUsedInternalKey() { return this._numberOfUsedInternalKey; }

  get createSpecificAccount() { return this._createSpecificAccount; }

  /**
   * @param {string} purpose
   * @param {string} coinType
   * @param {string} account
   * @param {string} timestamp
   * @param {string} name
   * @param {PBCryptocurrencyType} cryptocurrencyType
   */
  static forCreateAccount(purpose, coinType, account, timestamp, name, cryptocurrencyType) {
    const obj = new PBHdwAccountInfo(
      purpose, coinType, account, timestamp, name, cryptocurrencyType,
      null, null, null, null, null, false,
    );
    return obj;
  }

  /**
   * @param {string} purpose
   * @param {string} coinType
   * @param {string} account
   * @param {string} timestamp
   * @param {string} name
   * @param {PBCryptocurrencyType} cryptocurrencyType
   */
  static forCreateSpecificAccount(purpose, coinType, account, timestamp, name, cryptocurrencyType) {
    const obj = new PBHdwAccountInfo(
      purpose, coinType, account, timestamp, name, cryptocurrencyType,
      null, null, null, null, null, true,
    );
    return obj;
  }
}

module.exports = PBHdwAccountInfo;
