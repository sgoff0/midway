import SmocksHapi from '../smocks/hapi';
import * as Hapi from '@hapi/hapi';
import * as HapiSwagger from 'hapi-swagger';
import * as Inert from '@hapi/inert';
import * as Vision from '@hapi/vision';
import * as Logger from 'testarmada-midway-logger';

export default {
  runHapiWithPlugins: function (server, midwayOptions, callback) {
    // Smocks plugin
    server.midwayOptions = midwayOptions;
    registerMidwayPlugin(server, callback);
  }
};

function registerMidwayPlugin(server, callback) {
  const smocksPlugin = SmocksHapi.toPlugin({
    onRegister: function (server, options, next) {
      return next();
    }
  }, server.midwayOptions);

  smocksPlugin.attributes = {
    name: 'smocks-plugin'
  };

  const swaggerOpts = {
    info: {
      'title': 'Midway API Documentation',
      'version': require('./../../package.json').version
    },
    documentationPath: '/midway_api_doc'
  };
  Logger.debug('Swagger opts');
  Logger.debug(swaggerOpts);

  server.register([smocksPlugin, Inert, {
    'register': HapiSwagger,
    'options': swaggerOpts
  }, Vision], function (err) {
    if (err) {
      Logger.error(err);
    }
    try {
      server.start(function () {
        const timeTaken = Date.now() - server.midwayOptions.startTime;
        Logger.debug('Time taken by Midway Server to start:' + timeTaken + ' ms');
      });
      if (callback) {
        return callback(server);
      }
    } catch (e) {
      Logger.error(e);
      Logger.warn('It\'s possible that the Hapi server Midway is running on has already been started: this will happen if you run Midway as a plugin on an existing server.');
      return callback(e);
    }
  });
}