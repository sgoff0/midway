import * as Logger from 'testarmada-midway-logger';
// const Promise = require('bluebird');
import * as Path from 'path';
import Clone from './clone';
import Constants from '../constants';

class RepoUtil {

  private multiRepoDirectory: string;

  public getMultiRepoDirectory = () => {
    Logger.debug('Getting multiRepoDirectory. ' + this.multiRepoDirectory);
    return this.multiRepoDirectory;
  }

  public setMultiRepoDirectory = (multiRepoDir: string) => {
    Logger.debug('Setting multiRepoDirectory to ' + multiRepoDir);
    this.multiRepoDirectory = multiRepoDir;
  }

  public validateRepoInfo = (repos: string[]) => {
    const requiredFields = ['git', 'mocks', 'data'];

    repos.forEach(function (repo) {
      requiredFields.forEach(function (field) {
        if (repo[field] === undefined) {
          throw new Error('Missing field ' + field + ' in ' + JSON.stringify(repo, null, 3));
        }
      });
    });
  }

  public requireEndpoints = (repos) => {
    if (repos && repos instanceof Array) {
      repos.forEach(function (repo) {
        Logger.debug('Setting multiRepoDirectory to ' + repo.data);
        this.setMultiRepoDirectory(repo.data);

        Logger.debug('Requiring now ..repos' + repo.mocks);
        try {
          const endPointLocation = Path.join(process.cwd(), Constants.MULTI_REPOS_PATH, repo.mocks);
          Logger.debug('Requiring end point ::' + endPointLocation);
          require(endPointLocation);
        } catch (e) {
          this.setMultiRepoDirectory(undefined);
          Logger.error(e);
          throw new Error(e);
        }
      });
    }
    this.setMultiRepoDirectory(undefined);
  }

  public handleMultipleRepos = (midwayOptions) => {
    if (midwayOptions.multipleGitRepos) {
      this.validateRepoInfo(midwayOptions.multipleGitRepos);

      return Clone(midwayOptions.multipleGitRepos).then((repos) => {
        Logger.debug(repos);
        this.requireEndpoints(repos);
        Logger.debug('Loaded all external routes');
        return Promise.resolve();
      }).catch((err) => {
        return Promise.reject(err);
      });
    } else {
      return Promise.resolve();
    }
  }
}

export default new RepoUtil();