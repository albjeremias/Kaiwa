var fs = require('fs');
var express = require('express');

var config = require('../config').server;

var app = express();
var serveStatic = require('serve-static');

app.use(serveStatic('./public'));
app.all("*", function (req, res) { res.sendfile('./public/index.html'); });

app.listen(config.port, function () {
    console.log('Kaiwa Server launched on port ' + config.port);
});
