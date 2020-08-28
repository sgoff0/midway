"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Kill = require('tree-kill');
const Logger = require("testarmada-midway-logger");
function default_1(pid, signal, callback) {
    signal = signal || 'SIGKILL';
    Logger.info('Killing process id ' + pid + ' and its descendant processes with signal ' + signal);
    try {
        Kill(pid, signal, function (err) {
            if (err) {
                Logger.info('Error in killing process with pid ' + pid);
                Logger.error(err);
            }
            else {
                Logger.info('Killed process with pid pid ' + pid);
            }
            if (callback) {
                return callback();
            }
        });
    }
    catch (e) {
        Logger.error('Error in killing process with pid :' + pid + ' , error:' + e.message);
        if (callback) {
            return callback();
        }
    }
}
exports.default = default_1;
;
//# sourceMappingURL=kill-process.js.map