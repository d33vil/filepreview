'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _tracer = require('tracer');

var _tracer2 = _interopRequireDefault(_tracer);

var _filepreview = require('./filepreview');

var _filepreview2 = _interopRequireDefault(_filepreview);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.log = _tracer2.default.console().log;
global.info = _tracer2.default.console().info;
global.trace = _tracer2.default.console().trace;
global.debug = _tracer2.default.console().debug;
global.warn = _tracer2.default.console().warn;
global.error = _tracer2.default.console().error;

var app = (0, _express2.default)();

app.post('preview', function (req, res, next) {
  log('here');
});

var server = app.listen(3010);
log('filepreview server bound to port 3010');
_filepreview2.default.generate('pdf-test.pdf', 'output.png', function (err) {
  log(err);
});