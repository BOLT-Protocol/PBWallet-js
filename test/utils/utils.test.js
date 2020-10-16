const should = require('should');
const os = require('os');
const fs = require('fs');
const Utils = require('../../lib/utils/utils');

describe('#Utils test', () => {
  describe('#randomStr function', () => {
    it('randomStr() default length should be 64', (done) => {
      should.equal(Utils.randomStr().length, 64);
      done();
    });

    it('randomStr(20).length should be 20', (done) => {
      should.equal(Utils.randomStr(20).length, 20);
      done();
    });
  });

  describe('#initialPath function', () => {
    const testFolder = `${os.homedir()}/.test${Utils.randomStr(64)}`;

    it('initialPath is reject when no params', (done) => {
      Utils.initialPath().should.be.rejected();
      done();
    });

    it('initialPath should create folder', (done) => {
      Utils.initialPath(testFolder)
        .then((newPath) => {
          should.equal(newPath, testFolder);

          // check folder is exist
          fs.stat(testFolder, (err, status) => {
            if (err) {
              should.notEqual(err.code, 'ENOENT');
              return;
            }
            should.exist(status);
            fs.rmdir(testFolder, () => {});
          });
        })
        .catch((e) => {
          should.equal(e.code, 'EEXIST');
        });

      done();
    });
  });

  describe('#initialEnv function', () => {
    it('initialEnv should ', (done) => {
      should.equal(Utils.randomStr().length, 64);
      done();
    });

    it('randomStr(20).length should be 20', (done) => {
      should.equal(Utils.randomStr(20).length, 20);
      done();
    });
  });
});
