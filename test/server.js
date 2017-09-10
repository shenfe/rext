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

/* CORS middleware */
const allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');

    next();
};

(function () {
    let port = 4011;
    let path = 'dist';
    let app = express();
    app.use(allowCrossDomain);
    app.use(cookieParser());
    app.use(express.static(path));
    app.options('/1.json', function (req, res) {
        res.header('Access-Control-Allow-Origin', '127.0.0.1:4010');
    });
    app.get('/1.json', function (req, res) {
        res.header('Access-Control-Allow-Credentials', 'true');
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

(function () {
    let port = 4010;
    let path = 'test';
    let app = express();
    app.use(cookieParser());
    app.use(express.static(path));
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

console.log(`ip: ${ipAddr}`);
open(`http://${ipAddr}:4010/test1.html`);
