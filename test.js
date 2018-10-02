/**
* MIT License
*
* Copyright (c) 2018-present, Walmart Inc.,
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*/
const glob = require('glob-promise');
const path = require('path');
const coverageDir = './test-reports';
const shell = require('shelljs');

// 1. Run each test file individually using `istanbul cover` command and store reports under ./test-reports. eg report for test/api-test/metrics-manager-tests.js gets stored under /test-reports/test/api-test/metrics-manager-tests
// 2. Collect the reports in two formats - lcov and text-summary
let finalExitCode = 0;
const pattern = './test/**/*.js';

async function run(files) {
    let failLog = '';
    const promises = files.map(async file => {
      let out = null;
      let dir = path.parse(file).dir;
      let coveragePath = path.join(process.cwd(), coverageDir, dir, path.basename(file, '.js'));
      let command = 'istanbul cover --dir ' + coveragePath + ' ./node_modules/.bin/_mocha ' + file + 
      '  -- -t 50000';
      console.log('\nRunning test:' + file);

      try {
        out = shell.exec(command);
      } catch(e) {
        console.log('Error in executing ' + command);
        console.log(e);
      }

      // Append logs for failed test
      if (out.code > 0) {
        failLog += out.stdout.toString();
      }

      // If any of the test fails, the process should exit with code 1
      finalExitCode = out.code || finalExitCode;
    });

    const results = await Promise.all(promises);
    

    if (failLog !== '') {
        console.log('\n\Few tests failed. Please look at the logs:');
        console.log(failLog);
    } else {
        console.log('\n\nRan all tests successfully');
    }

    try {
        shell.exec('istanbul report --root ' + coverageDir + ' --include **/coverage*.json', {silent:true});
        console.log('\n\nCoverage report generated under ' + coverageDir);
        console.log('\n\nFinal Coverage Summary');
        shell.exec('istanbul report --root ' + coverageDir + ' --include **/coverage*.json --format text-summary');        
    } catch (e) {
        console.log('Exception in generating reports');
        console.log(e);
    }

    if (finalExitCode > 0) {
        shell.exit(1);
    }
}

shell.exec('rm -rf ' + coverageDir);
shell.exec('rm -rf coverage');

glob(pattern).then(function(files) {
    console.log(files);
    run(files);
});
