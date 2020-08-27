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

import * as Path from 'path';
import * as Fs from 'fs';
const Mkdirp = require('mkdirp');
const Pem = require('pem');
const Promise = require('bluebird');

import Constants from '../constants';
import Utils from '../utils/common-utils';
import * as Logger from 'testarmada-midway-logger';

export default {
  genCerts: function (resolvedPath, callback) {
    const certsDir = Path.join(resolvedPath, Constants.MIDWAY_CERT_FOLDER_NAME);
    const keyFilePath = Path.join(certsDir, Constants.MIDWAY_PRIVATE_KEY_FILE);
    const certFilePath = Path.join(certsDir, Constants.MIDWAY_CERTIFICATE_FILE);

    // Ensure that certs dir path exists
    Mkdirp.sync(certsDir);

    generateKeyAndCertificate(keyFilePath, certFilePath).then(function (tls) {
      return callback(null, tls);
    }).catch(function (err) {
      Logger.error('Error occurred while generating certificates', err.message);
      return callback(err);
    });
  }
};

function generateKeyAndCertificate(keyFile, certFile) {
  return new Promise(function (resolve, reject) {
    let tls;
    if (Utils.checkIfCertsExists(keyFile, certFile)) {
      Logger.info('Private Key and Certificate already exists.');
      tls = {
        key: Fs.readFileSync(keyFile),
        cert: Fs.readFileSync(certFile)
      };
      return resolve(tls);
    }

    Pem.createCertificate({ days: 365, selfSigned: true }, function (error, keys) {
      if (error) {
        Logger.error('Error occurred while generating certificate', error.message);
        return reject(error);
      }
      Logger.info('Writing private key to ' + keyFile);
      Logger.info('Writing certificate to ' + certFile);
      const certsArr = [{
        file: keyFile,
        data: keys.serviceKey
      }, {
        file: certFile,
        data: keys.certificate
      }];

      const writeAll = certsArr.map(function (cert) {
        return writeCerts(cert.file, cert.data);
      });

      Promise.all(writeAll).then(function () {
        Logger.info('Wrote certificates successfully');
        return resolve({
          key: keys.serviceKey,
          cert: keys.certificate
        });
      }).catch(function (err) {
        Logger.error('Error in writing certs..', err);
        return reject(err);
      });
    });
  });
}

function writeCerts(file, data) {
  Logger.info('Writing ' + file);
  const writeFile = Promise.promisify(Fs.writeFile);
  return writeFile(file, data);
}