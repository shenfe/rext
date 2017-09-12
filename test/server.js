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

const bodyParser = require('body-parser');

(function () {
    let port = 4011;
    let path = 'dist';
    let app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/iframe-agent.html', function (req, res) {
        res.set('Content-Type', 'text/html');
        res.send(fs.readFileSync('./test/iframe-agent.html', 'utf8'));
    });

    app.use(express.static(path));
    app.use(cookieParser());

    /* CORS middleware */
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', req.header('Origin'));
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, Content-Length, X-Requested-With');
        next();
    });

    app.options('/get2', function (req, res) {
        res.send(200);
    });

    app.get('/get2', function (req, res) {
        res.json({
            code: 200,
            msg: 'ok',
            data: {
                name: 'get2'
            }
        });
    });

    app.options('/get3', function (req, res) {
        res.header('Access-Control-Allow-Credentials', 'true');
        res.send(200);
    });

    app.get('/get3', function (req, res) {
        res.header('Access-Control-Allow-Credentials', 'true');
        let ck = {
            cookies: req.cookies,
            signedCookies: req.signedCookies
        };
        console.log('requesting with cookie: ', JSON.stringify(ck, null, 4));
        if (ck.cookies) {
            res.json({
                code: 200,
                msg: 'ok',
                data: {
                    name: 'get3'
                }
            });
        } else {
            res.json({
                code: 500,
                msg: 'Credentials not sent!'
            });
        }
    });

    app.post('/post2', function (req, res) {
        res.json({
            code: 200,
            msg: 'ok',
            data: {
                name: 'post2',
                echo: req.body.json
            }
        });
    });

    app.options('/post3', function (req, res) {
        res.header('Access-Control-Allow-Credentials', 'true');
        res.send(200);
    });

    app.post('/post3', function (req, res) {
        res.header('Access-Control-Allow-Credentials', 'true');
        let ck = {
            cookies: req.cookies,
            signedCookies: req.signedCookies
        };
        console.log('requesting with cookie: ', JSON.stringify(ck, null, 4));
        if (ck.cookies) {
            res.json({
                code: 200,
                msg: 'ok',
                data: {
                    name: 'post3',
                    echo: req.body.json
                }
            });
        } else {
            res.json({
                code: 500,
                msg: 'Credentials not sent!'
            });
        }
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

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/get1', function (req, res) {
        res.json({
            code: 200,
            msg: 'ok',
            data: {
                name: 'get1'
            }
        });
    });

    app.post('/post1_1', function (req, res) {
        console.log(req.body);
        res.json({
            code: 200,
            msg: 'ok',
            data: {
                name: 'post1_1',
                echo: req.body.json
            }
        });
    });

    app.post('/post1_2', function (req, res) {
        res.json({
            code: 200,
            msg: 'ok',
            data: {
                name: 'post1_2',
                echo: req.body.json
            }
        });
    });

    app.post('/post1_3', function (req, res) {
        res.json({
            code: 200,
            msg: 'ok',
            data: {
                name: 'post1_3',
                echo: req.body.json
            }
        });
    });

    console.log(`Listening to ${port}`);
    return app.listen(port);
})();

console.log(`ip: ${ipAddr}`);
open(`http://${ipAddr}:4010/test1.html`);
