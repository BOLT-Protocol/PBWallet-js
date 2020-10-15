const Emitter = require('events').EventEmitter;

let instance;

class PBEventEmitter {
  constructor() {
    this.em = new Emitter();
  }

  addListener(event, callback) {
    return this.em.addListener(event, callback);
  }

  on(event, callback) {
    return this.em.on(event, callback);
  }

  removeListener(event, callback) {
    return this.em.removeListener(event, callback);
  }

  emit(event) {
    return this.emit(event);
  }
}

const newInstance = () => {
  if (typeof dbInstance === 'object') {
    return instance;
  }

  instance = new PBEventEmitter();
  return instance;
};

module.exports = newInstance();
