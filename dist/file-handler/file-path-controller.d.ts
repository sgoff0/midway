import { FileHandlerInput } from './file-handler';
declare class FilePathController {
    getFilePath: (data: FileHandlerInput, base: any) => Promise<any>;
    findCodeSpecificFile: (directory: any, fileNameByURLCountAndCode: any, data: any) => Promise<any>;
    findCountSpecificFile: (directory: any, fileNameByURLCount: any, data: any) => Promise<any>;
    findDefaultFile: (defaultFileName: any, directory: any, data: any) => Promise<any>;
    createCustomLocationFilePath: (base: any, filepath: any) => any;
    createFilePath: (data: FileHandlerInput, base: any) => Promise<any>;
    getDefaultFileName: (data: FileHandlerInput) => any;
}
declare const _default: FilePathController;
export default _default;
