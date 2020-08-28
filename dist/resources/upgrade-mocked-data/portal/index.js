"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
index_1.default.route({
    id: "GET /portal",
    label: "/portal",
    path: "/portal",
    method: "GET",
    handler(req, h) {
        const headers = {
            Date: "Wed, 03 Apr 2019 19:39:25 GMT",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
            "X-Powered-By": "Servlet/3.0",
            "Cache-Control": "no-cache, no-store, no-transform, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
            "Site-Id": "Inet8TSYS",
            "Set-Cookie": "TS017f2f37=01fee704dc4472f832b67fa93213ff10bccb011b80d7dbed3f5a54cae418c0bd7af40e984fc2d806232648cebb23974bc81cb822171fd85a566cf0422aa4813797153e970d06ac1b1d1bd7f8fc628f8a668954b937; path=/; domain=.discovercard.com; HTTPonly",
            "Keep-Alive": "timeout=15",
            "Content-Type": "application/json",
            "Content-Language": "en-US",
            "Transfer-Encoding": "chunked",
            Connection: "Keep-alive",
        };
        const code = 200;
        return index_1.default.util.respondWithFile(this, h, { code, headers });
    },
});
index_1.default
    .route({
    id: "POST /portal",
    label: "/portal",
    path: "/portal",
    method: "POST",
    handler(req, h) {
        const headers = {};
        const code = 200;
        return index_1.default.util.respondWithFile(this, h, { code, headers });
    },
})
    .variant({
    id: "Bank-OOB",
    label: "Bank-OOB",
    handler(req, h) {
        return index_1.default.util.respondWithFile(this, h, {
            code: 401,
            headers: {
                "WWW-Authenticate": 'BankSA realm="mapi.discoverbank.com"',
            },
        });
    },
});
//# sourceMappingURL=index.js.map