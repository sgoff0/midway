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
var Logger = require('testarmada-midway-logger');
var Promise = require('bluebird');
var Path = require('path');
var Clone = require('./clone');
var Constants = require('../constants');
var multiRepoDirectory;

module.exports = {

  getMultiRepoDirectory: function () {
    Logger.debug('Getting multiRepoDirectory. ' + multiRepoDirectory);
    return multiRepoDirectory;
  },

  setMultiRepoDirectory: function (multiRepoDir) {
    Logger.debug('Setting multiRepoDirectory to ' + multiRepoDir);
    multiRepoDirectory = multiRepoDir;
  },

  validateRepoInfo: function (repos) {
    var requiredFields = ['git', 'mocks', 'data'];

    repos.forEach(function (repo) {
      requiredFields.forEach(function (field) {
        if (repo[field] === undefined) {
          throw new Error('Missing field ' + field + ' in ' + JSON.stringify(repo, null, 3));
        }
      });
    });
  },

  requireEndpoints: function (repos) {
    var self = this;
    if (repos && repos instanceof Array) {
      repos.forEach(function (repo) {
        Logger.debug('Setting multiRepoDirectory to ' + repo.data);
        self.setMultiRepoDirectory(repo.data);

        Logger.debug('Requiring now ..repos' + repo.mocks);
        try {
          var endPointLocation = Path.join(process.cwd(), Constants.MULTI_REPOS_PATH, repo.mocks);
          Logger.debug('Requiring end point ::' + endPointLocation);
          require(endPointLocation);
        } catch (e) {
          self.setMultiRepoDirectory(undefined);
          Logger.error(e);
          throw new Error(e);
        }
      });
    }
    this.setMultiRepoDirectory(undefined);
  },


  handleMultipleRepos: function (midwayOptions) {
    var self = this;
    if (midwayOptions.multipleGitRepos) {
      this.validateRepoInfo(midwayOptions.multipleGitRepos);

      return Clone(midwayOptions.multipleGitRepos).then(function (repos) {
        Logger.debug(repos);
        self.requireEndpoints(repos);
        Logger.debug('Loaded all external routes');
        return Promise.resolve();
      }).catch(function (err) {
        return Promise.reject(err);
      });
    } else {
      return Promise.resolve();
    }
  }

};
