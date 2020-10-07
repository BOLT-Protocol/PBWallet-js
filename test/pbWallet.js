const should = require('should');
const pbWallet = require('../lib/pb_wallet');

describe('#test for mocha', () => {
  it('test', (done) => {
    should.equal(pbWallet.constructor.name, 'PBWallet');
    done();
  });
});
