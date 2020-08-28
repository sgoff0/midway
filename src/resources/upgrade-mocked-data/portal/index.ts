import midway from '../../../index';

midway.route({
  id: "GET /portal",
  label: "/portal",
  path: "/portal",
  method: "GET",
  handler(req, h) {
    const headers = {
      Date: "Wed, 03 Apr 2019 19:39:25 GMT",
      "Site-Id": "Inet8TSYS",
      "Transfer-Encoding": "chunked",
      Connection: "Keep-alive",
    };
    const code = 200;

    return midway.util.respondWithFile(this, h, { code, headers });
  },
});

// -- plop GET variant hook --
// The above line is required for our plop generator and should not be changed!

midway
  .route({
    id: "POST /portal",
    label: "/portal",
    path: "/portal",
    method: "POST",
    handler(req, h) {
      const headers = {};
      const code = 200;
      return midway.util.respondWithFile(this, h, { code, headers });
    },
  })
  .variant({
    id: "Bank-OOB",
    label: "Bank-OOB",
    handler(req, h) {
      return midway.util.respondWithFile(this, h, {
        code: 401,
        headers: {
          "WWW-Authenticate": 'some test header',
        },
      });
    },
  });
// -- plop POST variant hook --
// The above line is required for our plop generator and should not be changed!
