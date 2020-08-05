export const argv = require('yargs').usage('Usage: node $0 [options]').describe('midwayHost', 'Host address for midway server').string('midwayHost').describe('midwayPort', 'Port number for midway server').number('midwayPort').describe('httpsPort', 'Https Port number for midway server').number('httpsPort').describe('project', 'Your project name. Eg. homepage, cart').string('project').describe('midwaySessions', 'Number of parallel sessions beside default').number('midwaySessions').describe('mockedData', 'Mocked data directory').string('mockedData').example('node $0 --midwayHost localhost --midwayPort 8090', 'Start the midway server at http://localhost:8090/midway').example('node $0 --midwayHost http://localhost', 'Start the midway server at http://localhost:8080/midway - using default port').example('node $0 --midwayHost http://localhost --midwaySessions 2', 'Start the midway server at http://localhost:8080/midway - using default port with two parallel sessions plus one default session').help('h').alias('h', 'help').argv;