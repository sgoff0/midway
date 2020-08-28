import Route from '../smocks/route-model';

interface UserRoute {
    routeObject: Route,
    routeData: any
}

export interface MidwayOptions {
    port: number,
    mockedDirectory: string,
    userRoute: UserRoute[],
    startTime: Date,
    httpsPort: number | void,
    host: string,
    project: string,
    proxyPort: number | void,
    proxyHost: string,
    sessions: number,
    resolvedPath: string,
    respondWithFileHandler: () => void,
    collectMetrics: boolean,
}