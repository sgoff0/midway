import Route from '../smocks/route-model';

interface UserRoute {
    routeObject: Route,
    routeData: any
}

export interface MidwayOptions {
    port: number | string,
    mockedDirectory: string,
    userRoute?: UserRoute[],
    startTime?: Date,
    httpsPort?: number | void,
    host?: string,
    project?: string,
    proxyPort?: number | void,
    proxyHost?: string,
    sessions?: number,
    resolvedPath?: string,
    // respondWithFileHandler?: () => void,
    respondWithFileHandler?: (data: any) => Promise<any>,
    collectMetrics?: boolean,
    multipleGitRepos?: any,
    userRoutes?: any,
}