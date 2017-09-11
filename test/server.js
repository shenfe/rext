const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const open = require('open');
const ip = require('ip');
const ipAddr = ip.address();

fs.writeFileSync(path.resolve(process.cwd(), './test/iframe-agent.html'),
    fs.readFileSync(path.resolve(process.cwd(), './dist/iframe-agent.html'), 'utf8')
        .replace('/* Define a whitelist of host names here, e.g. \'.invoker.com\'. */', `"${ipAddr}"`)
);

(function () {
    let port = 4011;
    let path = 'dist';
    let app = express();
    app.use(express.static(path));
    app.use(cookieParser());

    /* CORS middleware */
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', req.header('Origin'));
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, Content-Length, X-Requested-With');

        /* Intercepts OPTIONS method */
        if ('OPTIONS' === req.method) {
            res.send(200);
        } else {
            next();
        }
    });

    app.get('/2.json', function (req, res) {
        res.json({
            code: 200,
            msg: 'ok',
            data: {
                name: '2'
            }
        });
    });
    console.log(`Listening to ${port}`);
    return app.listen(port);
})();

(function () {
    let port = 4010;
    let path = 'test';
    let app = express();
    app.use(cookieParser());
    app.use(express.static(path));
    app.get('/1.json', function (req, res) {
        res.json({
            code: 200,
            msg: 'ok',
            data: {
                name: '1'
            }
        });
    });
    console.log(`Listening to ${port}`);
    return app.listen(port);
})();

console.log(`ip: ${ipAddr}`);
open(`http://${ipAddr}:4010/test1.html`);
