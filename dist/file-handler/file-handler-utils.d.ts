import { FileHandlerInput, FileHandlerOptions } from './file-handler';
declare class FileHandlerUtils {
    variables: {
        mimeTypeOfResponse: any;
    };
    collectMetaInformationFromfile: (fileData: any, options: any) => any;
    setCurrentMimeType: (mimeType: any) => void;
    setHeadersAndCookies: (response: any, options: FileHandlerOptions) => any;
    setHeaders: (response: any, headers: any) => any;
    setCookies: (response: any, cookies: any) => any;
    getPathWithoutSessionId: (data: any) => any;
    getRouteMethod: (data: FileHandlerInput) => string;
    getCodeFromFilePath: (filePath: string) => number;
    handleCodeFile: (fileType: any, filePath: any, data: any) => void;
    retrieveFileDataBasedOnPayload: (payload: any, options: any) => any;
    selectFileFromDirectory: (directory: any, fileName: any) => Promise<any>;
    getNextValue: (data: any, defaultFileName: any) => number;
}
declare const _default: FileHandlerUtils;
export default _default;
