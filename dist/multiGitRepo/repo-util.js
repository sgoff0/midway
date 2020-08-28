"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger = require("testarmada-midway-logger");
const Path = require("path");
const clone_1 = require("./clone");
const constants_1 = require("../constants");
class RepoUtil {
    constructor() {
        this.getMultiRepoDirectory = () => {
            Logger.debug('Getting multiRepoDirectory. ' + this.multiRepoDirectory);
            return this.multiRepoDirectory;
        };
        this.setMultiRepoDirectory = (multiRepoDir) => {
            Logger.debug('Setting multiRepoDirectory to ' + multiRepoDir);
            this.multiRepoDirectory = multiRepoDir;
        };
        this.validateRepoInfo = (repos) => {
            const requiredFields = ['git', 'mocks', 'data'];
            repos.forEach(function (repo) {
                requiredFields.forEach(function (field) {
                    if (repo[field] === undefined) {
                        throw new Error('Missing field ' + field + ' in ' + JSON.stringify(repo, null, 3));
                    }
                });
            });
        };
        this.requireEndpoints = (repos) => {
            if (repos && repos instanceof Array) {
                repos.forEach(function (repo) {
                    Logger.debug('Setting multiRepoDirectory to ' + repo.data);
                    this.setMultiRepoDirectory(repo.data);
                    Logger.debug('Requiring now ..repos' + repo.mocks);
                    try {
                        const endPointLocation = Path.join(process.cwd(), constants_1.default.MULTI_REPOS_PATH, repo.mocks);
                        Logger.debug('Requiring end point ::' + endPointLocation);
                        require(endPointLocation);
                    }
                    catch (e) {
                        this.setMultiRepoDirectory(undefined);
                        Logger.error(e);
                        throw new Error(e);
                    }
                });
            }
            this.setMultiRepoDirectory(undefined);
        };
        this.handleMultipleRepos = (midwayOptions) => {
            if (midwayOptions.multipleGitRepos) {
                this.validateRepoInfo(midwayOptions.multipleGitRepos);
                return clone_1.default(midwayOptions.multipleGitRepos).then((repos) => {
                    Logger.debug(repos);
                    this.requireEndpoints(repos);
                    Logger.debug('Loaded all external routes');
                    return Promise.resolve();
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }
            else {
                return Promise.resolve();
            }
        };
    }
}
exports.default = new RepoUtil();
//# sourceMappingURL=repo-util.js.map