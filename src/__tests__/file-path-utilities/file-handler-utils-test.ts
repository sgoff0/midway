import * as path from 'path';
import filePathController from '../../file-handler/file-handler-utils';
import constants from '../../constants';

describe('File-Handler-Utils', function () {
    it('should throw an error when incorrect path is set in setPayload to retrieveFileDataBasedOnPayload ', function () {
        expect(filePathController.retrieveFileDataBasedOnPayload.bind(filePathController, path.join(constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC, 'message/default.json'))).toThrow(Error);
    });
    it('should return a JSON, txt or JS file selectFileFromDirectory ', async () => {
        const result = await filePathController.selectFileFromDirectory(path.join(constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC, 'extension/GET'), 'dummy');
        expect(result).toBe('src/resources/mocked-data/extension/GET/dummy.json');
        // });
    });
    it('should return undefined when none of the extension of the files provided matches the valid extensions ', async function () {
        const result = await filePathController.selectFileFromDirectory(path.join(constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC, 'extension/GET'), 'dummy_with_not_valid_extension');
        expect(result).toBe(undefined);
    });
});
