import SmocksHapi from '../smocks/hapi';
import * as Hapi from '@hapi/hapi';
import * as HapiSwagger from 'hapi-swagger';
import * as Inert from '@hapi/inert';
import * as Vision from '@hapi/vision';
// import * as Logger from 'testarmada-midway-logger';
import * as Logger from 'testarmada-midway-logger';
import { MidwayOptions } from '../types/MidwayOptions';


export default {
  // runHapiWithPlugins: async function (server: Hapi.Server, midwayOptions) {
  runHapiWithPlugins: async function (server, midwayOptions: MidwayOptions) {
    // Smocks plugin
    Logger.info("Midway options: ", midwayOptions);
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
}