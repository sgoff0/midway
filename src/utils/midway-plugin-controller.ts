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

// const SmocksHapi = require('testarmada-midway-smocks/hapi');
import SmocksHapi from '../smocks/hapi';
// const HapiSwagger = require('hapi-swagger');

import * as Hapi from 'hapi';
import * as HapiSwagger from 'hapi-swagger';
const Inert = require('inert');
const Vision = require('vision');
import * as Logger from 'testarmada-midway-logger';

export default {
  runHapiWithPlugins: async function (server, midwayOptions) {
    // Smocks plugin
    server.midwayOptions = midwayOptions;
    await registerMidwayPlugin(server);
  }
};

const swaggerOptions: HapiSwagger.RegisterOptions = {
  info: {
    title: 'Midway API Documentation',
    version: require('./../../package.json').version
  },
  documentationPath: '/midway_api_doc'
};


async function registerMidwayPlugin(server) {
  const smocksPlugin = SmocksHapi.toPlugin(server.midwayOptions);

  // TODO sgoff: pick up here on name

  await server.register([
    {
      plugin: Inert
    },
    {
      plugin: Vision
    },
    {
      plugin: smocksPlugin
    },
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    }
  ]);
  // server.start();


  // // TODO sgoff0 hapi 17 update required to server.register
  // server.register([smocksPlugin, Inert, {
  //   'register': HapiSwagger,
  //   'options': swaggerOptions
  // }, Vision], function (err) {
  //   if (err) {
  //     Logger.error(err);
  //   }
  //   try {
  //     server.start(function () {
  //       const timeTaken = Date.now() - server.midwayOptions.startTime;
  //       Logger.debug('Time taken by Midway Server to start:' + timeTaken + ' ms');
  //     });
  //     if (callback) {
  //       return callback(server);
  //     }
  //   } catch (e) {
  //     Logger.error(e);
  //     Logger.warn('It\'s possible that the Hapi server Midway is running on has already been started: this will happen if you run Midway as a plugin on an existing server.');
  //     return callback(e);
  //   }
  // });
}