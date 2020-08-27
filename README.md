# MIDWAY

Test Armada Mocking Framework

[![Build Status](https://travis-ci.org/TestArmada/midway.svg?branch=master)](https://travis-ci.org/TestArmada/midway)
[![codecov](https://codecov.io/gh/TestArmada/midway/branch/master/graph/badge.svg)](https://codecov.io/gh/TestArmada/midway)

For more information and getting started guide [OTTO Mocking introduction](http://testarmada.io/documentation/Mocking/rWeb/JAVASCRIPT/Getting%20Started)

## API

---

[Midway API guide](http://testarmada.io/documentation/Mocking/rWeb/JAVASCRIPT/API%20Guide)

---

## Installation

---

```shell
$ npm install testarmada-midway
```

---

## Setup

To do a simple setup , do following :

- Create a directory with file `run-mock-server-console.js` with following code

```
require('./endpoints');
var midway = require('testarmada-midway');
midway.start({
    port: 8000,
    host: 'localhost'
});

```

- Create a file named `endpoints.js` with following code

```
var midway = require('testarmada-midway');
midway.id('example');

midway.route({
  id: 'helloFromMidway',
  label: 'Hello message from Midway',
  path: '/helloMidway',

  variantLabel: 'hello from midway',
  handler: function (req, h) {
    reply('Hello from Midway');
  }
});
```

Visit `http://localhost:8000/midway` to see admin console. You can visit `http://localhost:8000/helloMidway` to retrieve "Hello from Midway" message.

For instructions on how to setup midway in your project go to [Getting started guide](http://testarmada.io/documentation/Mocking/rWeb/JAVASCRIPT/Getting%20Started)

Note : When Midway starts, you will see the message `Starting midway server on https at https://localhost:4444/midway` . This is because `Midway`
starts `https` connection by default.

## Mocking API responses by files.

Midway provides infrastructure to return mocked API response using files. You can retrieve mocked JSON response for an API, save it in a file, and use it for development, testing or troubleshooting purposes. Midway's API to `midway.util.respondWithFile` gives an ability to return the response by reading a JSON file which can be assumed to be a response returned from backend API. This feature removes a dependency on availability of backend service. Also, makes a front end test case more reliable.

In order to use this feature, you can add a route in your `endpoints.js`

```
midway.route({
  id: 'respondWithFile',
  label: 'RespondWithFile',
  path: '/respondWithFile',

  variantLabel: 'respond with file',
  handler: function (req, h) {
    midway.util.respondWithFile(this, reply, {code: 202});
  }
})
```

and add following parameter to `midway.start()` method as follows :

```
midway.start({
    port: 8000,
    host: 'localhost',
    mockedDirectory: './mocked-data  // this can be provided as an absolute path as well.
});
```

The above route needs to have a file in the location `./mocked-data/respondWithFile/GET/default.json`.

If you visit `http://localhost:8000/respondWithFile`, you will see the response same as contents in `/.mocked-data/respondWithFile/GET/default.json`.

_Note_: `mockedDirectory` can be a absolute or relative filepath. If this entry is missing from start options, the default location of mocked files will be `resources/mocked-data` in your project.

## Adding Variants

`Variant` is a variation of the same route for which you would want to return a different response at a given time. For e.g, for the route `http://localhost:8000/message`, you might want to return `Hello World` by default but if you add a variant, you can have a different response for the same route.

_Example_

```
midway.route({
  id: 'message',
  label: 'Hello message',
  path: '/message',

  variantLabel: 'hello world',
  handler: function (req, h) {
    midway.util.respondWithFile(this, reply, {code: 202});
  }
})
  .variant({
    id: 'universe',
    label: 'hello universe',
    handler: function (req, h) {
      midway.util.respondWithFile(this, reply, {filePath: './message/GET/universe.json', code: 202});
    }
  });

```

The above variant route will return the contents of `./message/GET/universe.json` when the mock variant is set for the same route. More details [here](http://testarmada.io/documentation/Mocking/rWeb/JAVASCRIPT/Training%20Guide/Mocking%20101/Introduction%20to%20Variants).

Please note that `filePath` supports both absolute and relative filepath from project root.

## Mocked delayed response

A mocked response can also be delayed by some time specified by the user. You can simulate a delay (in ms) by passing `delay` as follows :

```
midway.route({
  id: 'message',
  label: 'Hello Variants',
  path: '/message',

  variantLabel: 'hello world',
  handler: function (req, h) {
    midway.util.respondWithFile(this, reply, {code: 202});
  }
})
.variant({
    id: 'variant with delay',
    label: 'variant with delay',
    handler: function (req, h) {
      midway.util.respondWithFile(this, reply, {filePath: './message/GET/variant_with_delay.json', delay: 1000});
    }
  })

```

## POST Calls

Post calls can be mocked as well. An example route for POST call would be:

```
midway.route({
  id: 'postTest',
  label: 'postTest',
  path: '/foo',
  method: 'POST',
  handler: function (req, h) {
    //req.payload should display the payload that was sent to request
    reply({message: 'POST SUCCESSFUL'});
  }
});

```

## Adding cookies to requests

Midway can also mock endpoints which need cookies to be added. Here is an example

```
midway.route({
  id: 'cookie',
  label: 'Test Cookies',
  path: '/api/testCookies',
  handler: function (req, h) {
    var cookies = [
      {name: 'com.wm.customer', value: 'vz7.0b5c56'},
      {name: 'CID', value: 'SmockedCID', options: {domain: 'domain', path: '/'}},
      {name: 'anotherCookie', value: 'cookieValue'}
    ];

    midway.util.respondWithFile(this, reply, {cookies: cookies});
  }
});
```

## HTTPS support

Midway provides HTTPS support as well. To enable `https`, just provide `httpsPort` in the object sent to `midway.start()`. :

```
midway.start({
     port: 3000,
     httpsPort: 4444,
     host: 'localhost',
     mockedDirectory: './test/resources/mocked-data',
   });
  }
```

Midway will create the private key and certificates which will be stored in the .certs directory inside the `mockedDirectory` provided by the user.

A private key and certificate is issued automatically when midway is started using `npm run start-mock`

## Parallel Sessions Test Call Flow

1. Register Session

   To use parallel sessions feature, each test case needs to register a new session from Midway server as part of test setup. Session can be registered using `registerSession` method available on Nightwatch's `client` object.

   ```
   Usage:
   client.registerSession(callback)
     `callback` gives you the midwaySession Id registered with Midway server for that test. Callee should also check if there's any error while registering the session

   Example:
   client.registerSession(function (err, sessId) {
       if (err) {
         console.error(err);
         return callback(new Error("Unable to get the sessionId"));
       }
       self.midwaySessionId = sessId;
       client.midwaySessionId = sessId;
   	//PROCEED WITH TESTS
     });
   ```

2. Execute Test Case

   If you're using API's like `setMockId` and `setMockVariant` , you need to send the registered `midwaySessionId` as parameter.

   (a) setMockId with session

   ```
   Usage:

   client.setMockId(mockId, midwaySessionId);


   Example:

   setMockId("email", client.midwaySessionId);
   ```

   (b) setMockVariant with session

   ```
   Usage:
   client.setMockVariant(options) [ Pass midwaySessionId in options ]

   Example:

   client.setMockVariant({fixture: "tempo", variant:	"categoryCarouselCurated", midwaySessionId: client.midwaySessionId})

   ```

3. Close Session

   User must close (deregister) a session as part of the test teardown. This helps to clean up the server state (resets mock id, url count and sets all the variants this test case may have set to default ). Also, this allows the same midwaySessionId (with clean state) to be reused for other tests.

   ```
   Usage:
   client.closeSession(midwaySessionId, callback)

   Example:

    client.closeSession(client.midwaySessionId, function (err) {
      if (err) {
         console.log("Error in closing session:" + client.midwaySessionId);
         //PROCEED
      }
   });
   ```

## Running Midway with Nightwatch tests

### Common Steps

#### Dependencies

- Use the following `testarmada-midway` and `testarmada-midway-magellan-nightwatch` versions to run tests in parallel with only application server and Midway server. Also update your `testarmada-magellan` to `10.0.3`

```
"testarmada-midway": "1.0.0",
"testarmada-midway-magellan-nightwatch": "1.0.0",
"testarmada-magellan": "10.0.3",
```

#### Application & Midway server set up

- Move the application server setup code to a new file [`appServer.js`](./examples/common/appServer.js) like this. <b>Note</b>: Depending on your application, your code might differ.

- Add the Midway server stop and start code in [`midwayServer.js`](./examples/common/midwayServer.js)

#### With parallel sessions

Using parallel sessions, we no longer need to start an application server and Midway server per process (Magellan worker). For more details on `parallel sessions`, please [refer](http://testarmada.io/documentation/Mocking/rWeb/JAVASCRIPT/Training%20Guide/Mocking%20301/Parallel%20Sessions).

- Update `magellan-init.js` like [this](./examples/with_parallel_sessions/magellan-init.js) to acquire ports and start application & Midway server

- Update `magellan.json` like [this](./examples/with_parallel_sessions/magellan.json) to have `setup_teardown` property

```
  "setup_teardown": "./test/automation/mocks/magellan-init.js"
```

- Update the path to `magellan.json` in `config` parameter to your Magellan command

```
	--config=test/automation/magellan.json
```

Update the base test class like [this](./examples/with_parallel_sessions/BaseTest.js) to:

    * Register for a session before each test starts execution
    * Pass the session id as part of the URL query parameter
    * Close session after each test execution is complete so that the session can be re-used by other test cases

<b>NOTES</b>

-     To use parallel sessions feature, we need each test case to be able to tell midway server which session id they are using. The following ways are supported:

  - Passing `midwaySessionId` as a query parameter e.g `http://www.walmart.com/homepage?midwaySessionId=qw4jdu`
  - Passing `midwaySessionId` as a header parameter
  - Passing `midwaySessionId` in the referrer field

- It is recommended that application server should set the [HTTP referer](https://en.wikipedia.org/wiki/HTTP_referer) field so that Midway can read the `midwaySessionId` parameter in case of re-direct or query/header params are not passed over to backend services.

#### Without parallel sessions

- Update `nightwatch-init.js` like [this](./examples/without_parallel_sessions/nightwatch-init.js)

- Make sure that your `nightwatch.json` has a property `globals_path` which stores the path for `nightwatch.init.js`

  ```
  "globals_path": "./test/automation/mocks/nightwatch-init.js",
  ```

- Update your `base test class` like [this](./examples/without_parallel_sessions/BaseTest.js)

### Debugging:

It is possible to set the log level through several options.

##### Option 1:

By simply setting the `MIDWAY_LOG_LEVEL` env variable to one of
`debug`, `info`, `warn` or `error`.

```bash
MIDWAY_LOG_LEVEL=debug node [your-node-project]
```

##### Option 2:

By setting it directly via the Midway object.

```javascript
// Set log level
midway.log.setLogLevel('debug');

// Get log level
midway.log.getLogLevel();

// Reset log level
midway.log.resetLogLevel();
```

##### Option 3:

By setting log level thru the Midway admin API

```bash
http://localhost:8000/midway/api/setloglevel/warn
```

Documentation in this project is licensed under Creative Commons Attribution 4.0 International License.Full details available at https://creativecommons.org/licenses/by/4.0/
