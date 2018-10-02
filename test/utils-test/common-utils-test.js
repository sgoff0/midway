/**
* MIT License
*
* Copyright (c) 2018-present, Walmart Inc.,
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*/
var Expect = require('chai').expect;
var Assert = require('chai').assert;
var commonUtils = require('../../lib/utils/common-utils');
var Constants = require('../../lib/constants');
require('../../resources/run-mock-server-api-dynamic.js');

describe('common-utils-test', function () {

  it('should set port if NOT already set and port is present in the request', function (done) {
    var req = {
      query: {
        mocksPort: 1000
      }
    };

    var originalPort = commonUtils.getPortInfo()[Constants.HTTP_PORT];

    commonUtils.setHttpPort(req.query.mocksPort);

    Expect(commonUtils.getPortInfo()[Constants.HTTP_PORT]).to.equal(1000);

    commonUtils.setHttpPort(originalPort);
    done();
  });

  it('readAndFilterDirectory : should throw  error when directory does not exist', function (done) {
    commonUtils.readAndFilterDirectory('notexist', 'test.txt', function (error) {
      Expect(error).to.be.contain('Directory not found at');
      done();
    });
  });

  it('readAndFilterDirectory: should throw  error when some kind of error is thrown from the function', function (done) {
    commonUtils.readAndFilterDirectory(1, 'test.txt', function (error) {
      Expect(error.message).to.be.contain('path must be a string');
      done();
    });
  });

  it('checkDirectoryExists: should return false when directory does not exist', function (done) {
    Expect(commonUtils.checkDirectoryExists('notexist')).to.be.false;
    done();
  });

  it('checkDirectoryExists: should return false if directory is not valid', function (done) {
    Expect(commonUtils.checkDirectoryExists(1)).to.be.false;
    done();
  });

  it('setMockVariant: should return error when mockPort is not sent', function (done) {
    commonUtils.setMockVariant({variant: 'xyz', fixture: 'abc'}, function (error) {
      Expect(error.message).to.equal('Missing mockPort in options');
      done();
    });
  });

  it('setMockVariant: should return error when variant is not sent', function (done) {
    commonUtils.setMockVariant({mockPort: 9000, fixture: 'abc'}, function (error) {
      Expect(error.message).to.equal('Missing variant in options');
      done();
    });
  });

  it('setMockVariant: should return error when fixture is not sent', function (done) {
    commonUtils.setMockVariant({mockPort: 9000, variant: 'abc'}, function (error) {
      Expect(error.message).to.equal('Missing fixture in options');
      done();
    });
  });

  it('readFileSynchronously: should return file as expected', function (done) {
    Expect(commonUtils.readFileSynchronously(__filename)).to.be.a('string');
    done();
  });

  it('readFile with callback: should return file as expected', function (done) {
    commonUtils.readFile('./resources/mocked-data/message/GET/default.json', function (error, data) {
      try {
        var json = JSON.parse(data.toString());
        Expect(json.collection.sectionOne.type).to.equal('message');
        Expect(json.collection.sectionOne.minRequired).to.equal(0);
        Expect(json.collection.sectionOne.stepNumber).to.equal(0);
      } catch (e) {
        Assert.fail('Failed to parse data returned from resources/mocked-data/message/GET/default.json');
      }
      done();
    });
  });

  it('readFile without callback: should return file as expected', function (done) {
    commonUtils.readFile('./resources/mocked-data/message/GET/default.json').then(function (data) {
      try {
        var json = JSON.parse(data.toString());
        Expect(json.collection.sectionOne.type).to.equal('message');
        Expect(json.collection.sectionOne.minRequired).to.equal(0);
        Expect(json.collection.sectionOne.stepNumber).to.equal(0);
      } catch (e) {
        Assert.fail('Failed to parse data returned from resources/mocked-data/message/GET/default.json');
      }
      done();
    }).catch(function (err) {
      Assert.fail('readFile with promises failed with the error ' + err.message);
      done();
    });
  });

  it('readDirectory without callback: should return files as expected', function (done) {
    commonUtils.readDirectory('./resources/mocked-data/message/GET').then(function (data) {
      Expect(data instanceof Array).to.be.true;
      Expect(data).to.not.be.null;
      Expect(data.length).to.be.above(0);
      done();
    }).catch(function (err) {
      Assert.fail('readFile with promises failed with the error ' + err.message);
      done();
    });
  });

  it('readDirectory without callback: should fail when not a valid directory', function (done) {
    commonUtils.readDirectory('./resources/mocked-data/message/GET/default.json').then(function (data) {
      Expect(data).to.be.null;
      Assert.fail('readDirectory with promises should fail when not passed a valid directory');
      done();
    }).catch(function (err) {
      Expect(err.message).to.equal('ENOTDIR: not a directory, scandir \'./resources/mocked-data/message/GET/default.json\'');
      done();
    });
  });

  it('respondWithMockVariant: should reply with variant', function (done) {
    var thisRoute = {
      route: {
        _variants: {
          variant1: {
            handler: function () {
              return 'Variant handler called';
            }
          }
        }
      }
    };

    var response = commonUtils.respondWithMockVariant(thisRoute, 'variant1', null, null);
    Expect(response).to.be.equal('Variant handler called');

    done();
  });

  it('respondWithMockVariant: should return error if no variant is present', function (done) {
    var thisRoute = {
      route: {
        _id: 1,
        _variants: {

        }
      }
    };

    var reply = function (value) {
      Expect(value).to.be.equal('No such variant: variant2 defined');
    };
    commonUtils.respondWithMockVariant(thisRoute, 'variant2', null, reply);
    done();
  });

  it('respondWithMockVariant: should return error if reply object is not defined', function (done) {
    var thisRoute = {
      route: {
        _id: 1,
        _variants: {}
      }
    };

    var response = commonUtils.respondWithMockVariant(thisRoute, 'variant2', null, null);
    Expect(response).to.be.equal('Reply object must be defined');
    done();
  });

  it('respondWithMockVariant: should return error if route is not defined', function (done) {
    var reply = function (value) {
      Expect(value).to.be.equal('No such variant: variant2 defined');
    };
    commonUtils.respondWithMockVariant(null, 'variant2', null, reply);
    done();
  });

  it('respondWithMockVariant: should return error if route.route is not defined', function (done) {
    var thisRoute = {};
    var reply = function (value) {
      Expect(value).to.be.equal('No such variant: variant2 defined');
    };
    commonUtils.respondWithMockVariant(thisRoute, 'variant2', null, reply);
    done();
  });

  it('respondWithMockVariant: should return error if route.route._variant is not defined', function (done) {
    var thisRoute = {
      route: {}
    };

    var reply = function (value) {
      Expect(value).to.be.equal('No such variant: variant2 defined');
    };
    commonUtils.respondWithMockVariant(thisRoute, 'variant2', null, reply);
    done();
  });

  it('getPortInfo: Verify default port is returned if not set', function (done) {
    var portInfoOriginal = commonUtils.getPortInfo();
    commonUtils.setServerProperties({port: undefined, httpsPort: undefined});
    var portInfo = commonUtils.getPortInfo();
    Expect(portInfo[Constants.HTTP_PORT]).to.equal(Constants.NOT_AVAILABLE);
    Expect(portInfo[Constants.HTTPS_PORT]).to.equal(Constants.NOT_AVAILABLE);
    commonUtils.setServerProperties({port: portInfoOriginal.httpPort, httpsPort: portInfoOriginal.httpsPort});
    done();
  });

  it('setMockVariant: Verify correct error message is returned if request is not successful', function (done) {
    commonUtils.setMockVariant({mockPort: 1234, variant: 'nonexistent', fixture: 'unknown'}, function (err) {
      Expect(err.name).to.equal('RequestError');
    });
    done();
  });

  it('setMockVariant: Verify no error if callback is not defined in case of error', function (done) {
    try {
      commonUtils.setMockVariant({mockPort: 1234, variant: 'nonexistent', fixture: 'unknown'});
    } catch (err) {
      Expect.fail();
    }
    done();
  });

  it('checkIfCertsExists: Verify false is returned if keyfile not found', function (done) {
    try {
      commonUtils.checkIfCertsExists('someFile', 'certFile', function (result) {
        Expect(result).to.equal(false);
      });
    } catch (err) {
      Expect.fail();
    }
    done();
  });

  it('checkIfCertsExists: Verify no error if cert file not found', function (done) {
    try {
      commonUtils.checkIfCertsExists(global.appRoot + '/lib/index.js', 'certFile');
    } catch (err) {
      Expect.fail();
    }
    done();
  });

  it('checkIfCertsExists: Verify no error if files are found and no callback is defined', function (done) {
    try {
      commonUtils.checkIfCertsExists(global.appRoot + '/lib/index.js', global.appRoot + '/lib/index.js');
    } catch (err) {
      Expect.fail();
    }
    done();
  });

  it('Metrics Manager: should set kairos db url', function (done) {
    var kairosDbUrl = 'http://kairos.server.com/api/v1/datapoints';
    commonUtils.setKairosDbUrl(kairosDbUrl);
    Expect(commonUtils.getKairosDbUrl()).to.be.equal(kairosDbUrl);
    done();
  });

});
