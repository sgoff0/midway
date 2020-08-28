import * as Fs from 'fs';
const GitUrlParse = require('git-url-parse');
const Promise = require('bluebird');
import * as Path from 'path';
import * as Logger from 'testarmada-midway-logger';
import Constants from './../constants';
const DEFAULT_GIT_BRANCH = 'master';

export default function (multipleGitRepos) {
  const allClones = multipleGitRepos.map(function (repo) {
    Logger.debug(JSON.stringify(repo, null, 3));

    const gitUrl = getSshGitUrl(repo.git);

    const gitDirectory = getGitDirectoryName(gitUrl);
    Logger.debug('GitDirectory : ' + gitDirectory);

    const absLocalDirectory = Path.join(process.cwd(), Constants.MULTI_REPOS_PATH, gitDirectory);
    Logger.debug('Local directory for external repositories:' + absLocalDirectory);

    return cloneRepo(gitUrl, absLocalDirectory, Path.join('/', gitDirectory, repo.mocks), Path.join('/', gitDirectory, repo.data), repo.branch);
  });

  return Promise.all(allClones).then(function (repos) {
    Logger.info('Cloned all repos successfully');
    return Promise.resolve(repos);
  }).catch(function (err) {
    return Promise.reject(err);
  });
};

function getGitDirectoryName(gitUrl) {
  return GitUrlParse(gitUrl).name;
}

function getSshGitUrl(gitUrl) {
  if (GitUrlParse(gitUrl).protocol === 'https') {
    gitUrl = GitUrlParse(gitUrl).toString('ssh'); // Convert to ssh if https
  }
  return gitUrl;
}

function cloneRepo(gitUrl, localPath, mockLocation, mockedDataLocation, branchInput) {
  const branch = branchInput || DEFAULT_GIT_BRANCH;

  return new Promise(function (resolve, reject) {

    if (Fs.existsSync(localPath)) {
      Logger.info(localPath + ' already exists.Doing git pull');
      Logger.debug('Changed localpath to ' + localPath + ' for git url ' + gitUrl);

      require('simple-git')(localPath).pull('origin', branch, function (error) {
        if (error) {
          return reject(new Error('Error in doing git pull for ' + gitUrl));
        }
        return resolve({ mocks: mockLocation, data: mockedDataLocation });
      });
    } else {
      Logger.info('Cloning .....' + gitUrl);
      const cloneOptions = ['-b' + branch];

      require('simple-git')('./').clone(gitUrl, localPath, cloneOptions, function (error) {
        if (error) {
          Logger.error(error.message);
          return reject(new Error(error));
        }
        Logger.info('Successfully cloned ' + gitUrl + ' at ' + localPath);
        return resolve({ mocks: mockLocation, data: mockedDataLocation });
      });
    }
  });
}