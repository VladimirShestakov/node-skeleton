/**
 * index
 * @author Vladimir Shestakov <boolive@yandex.ru>
 * @version 1.0
 * @created 28.09.2016
 */
const Promise = require("bluebird");
//Promise.promisifyAll(require("request"));
Promise.promisifyAll(require('crypto'));
Promise.promisifyAll(require('fs'));

const config = require('./config.js');
const services = require('./services');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//const morgan = require('morgan');

const app = express();

//app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

services.init(config).then(()=> {
    app.use(require('./controllers'));

    app.listen(config.server.port, config.server.host, function () {
        console.log(`Project server run on http://${config.server.host}:${config.server.port}`);
    });
});
