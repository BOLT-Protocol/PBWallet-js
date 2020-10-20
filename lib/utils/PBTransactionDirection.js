/* eslint-disable consistent-return */
/* eslint-disable getter-return */
/* eslint-disable default-case */

const TransactionDirection = {
  sent: 'sent',
  received: 'received',
  moved: 'moved', // this should never happen
};

class PBTransactionDirection {
  /**
   * @param {TransactionDirection} direction
   */
  constructor(direction) {
    this._direction = direction;
  }

  static get sent() { return TransactionDirection.sent; }

  static get received() { return TransactionDirection.received; }

  static get moved() { return TransactionDirection.moved; }

  get direction() { return this._direction; }

  get value() {
    switch (this._direction) {
      case TransactionDirection.sent:
        return 1;
      case TransactionDirection.received:
        return 2;
      case TransactionDirection.moved:
        return 3;
    }
  }

  /**
   * @param {number} value
   */
  static createByValue(value) {
    switch (value) {
      case 1:
        return new PBTransactionDirection(TransactionDirection.sent);
      case 2:
        return new PBTransactionDirection(TransactionDirection.sent);
      case 3:
        return new PBTransactionDirection(TransactionDirection.moved);
    }
  }

  get description() {
    switch (this._direction) {
      case TransactionDirection.sent:
        return 'send';
      case TransactionDirection.received:
        return 'receive';
      case TransactionDirection.moved:
        return 'received';
    }
  }
}

module.exports = PBTransactionDirection;
