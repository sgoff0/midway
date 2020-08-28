import { MidwayOptions } from '../types/MidwayOptions';
declare class RepoUtil {
    private multiRepoDirectory;
    getMultiRepoDirectory: () => string;
    setMultiRepoDirectory: (multiRepoDir: string) => void;
    validateRepoInfo: (repos: string[]) => void;
    requireEndpoints: (repos: any) => void;
    handleMultipleRepos: (midwayOptions: MidwayOptions) => any;
}
declare const _default: RepoUtil;
export default _default;
