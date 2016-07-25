var glob = require('glob');
var path = require('path');

var config = require('./webpack.config');
config.target = 'node';
config.entry = {'test': glob.sync(path.join(__dirname, 'test', '**', '*.ts'))};
config.output = {
    path: 'test-output',
    filename: 'test.js'
};

module.exports = config;
