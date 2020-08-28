import * as Hapi from '@hapi/hapi';
declare const routes: {
    setMockId: {
        id: string;
        label: string;
        path: string;
        config: {
            tags: string[];
        };
        handler: (req: any, h: Hapi.ResponseToolkit) => Hapi.ResponseObject;
    };
    getMockId: {
        id: string;
        label: string;
        path: string;
        config: {
            tags: string[];
        };
        handler: (req: any, h: Hapi.ResponseToolkit) => Hapi.ResponseObject;
    };
    resetMockId: {
        id: string;
        label: string;
        path: string;
        config: {
            tags: string[];
        };
        handler: (req: any, h: Hapi.ResponseToolkit) => Hapi.ResponseObject;
    };
    resetURLCount: {
        id: string;
        label: string;
        path: string;
        config: {
            tags: string[];
        };
        handler: (req: any, h: Hapi.ResponseToolkit) => Hapi.ResponseObject;
    };
    getURLCount: {
        id: string;
        label: string;
        path: string;
        config: {
            tags: string[];
        };
        handler: (req: any, h: Hapi.ResponseToolkit) => Hapi.ResponseObject;
    };
    checkSession: {
        id: string;
        label: string;
        path: string;
        config: {
            tags: string[];
        };
        handler: (req: any, h: Hapi.ResponseToolkit) => Hapi.ResponseObject;
    };
    getSessions: {
        id: string;
        label: string;
        path: string;
        config: {
            tags: string[];
        };
        handler: (req: any, h: Hapi.ResponseToolkit) => Hapi.ResponseObject;
    };
    registerSession: {
        id: string;
        label: string;
        path: string;
        config: {
            tags: string[];
        };
        handler: (req: any, h: Hapi.ResponseToolkit) => Hapi.ResponseObject;
    };
    closeSession: {
        id: string;
        label: string;
        path: string;
        config: {
            tags: string[];
        };
        handler: (req: any, h: Hapi.ResponseToolkit) => void;
    };
    setLogLevel: {
        id: string;
        label: string;
        path: string;
        config: {
            tags: string[];
        };
        handler: (req: any, h: Hapi.ResponseToolkit) => Hapi.ResponseObject;
    };
    getLogLevel: {
        id: string;
        label: string;
        path: string;
        config: {
            tags: string[];
        };
        handler: (req: any, h: Hapi.ResponseToolkit) => Hapi.ResponseObject;
    };
    resetLogLevel: {
        id: string;
        label: string;
        path: string;
        config: {
            tags: string[];
        };
        handler: (req: any, h: Hapi.ResponseToolkit) => Hapi.ResponseObject;
    };
    wildCardSupport: {
        id: string;
        method: string;
        path: string;
        label: string;
        handler: (req: any, h: Hapi.ResponseToolkit) => Hapi.ResponseObject;
    };
    adminRedirect: {
        id: string;
        method: string;
        path: string;
        label: string;
        handler: (req: any, h: Hapi.ResponseToolkit) => Hapi.ResponseObject;
    };
};
export default routes;
