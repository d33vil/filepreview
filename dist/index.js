'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _tracer = require('tracer');

var _tracer2 = _interopRequireDefault(_tracer);

var _filepreview = require('./filepreview');

var _filepreview2 = _interopRequireDefault(_filepreview);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storage = _multer2.default.diskStorage({});
(0, _multer2.default)({});
var upload = (0, _multer2.default)({
  storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 }
});

global.log = _tracer2.default.console().log;
global.info = _tracer2.default.console().info;
global.trace = _tracer2.default.console().trace;
global.debug = _tracer2.default.console().debug;
global.warn = _tracer2.default.console().warn;
global.error = _tracer2.default.console().error;

var app = (0, _express2.default)();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.post('/generate', upload.any(), function (req, res, next) {
  var file = (req.files || [])[0] || req.file;
  if (file) {
    log(file);
    _filepreview2.default.generate(file.path, '/tmp/preview.png', function (err) {
      if (err) {
        log(err);
        res.status(500);
        res.json({ error: err });
      } else {
        res.sendFile('/tmp/preview.png');
      }
    });
  } else {
    log('no file specified');
    res.status(500);
    res.json({ error: 'No File' });
  }
});
app.get('/test', function (req, res, next) {
  _filepreview2.default.generate('pdf-test.pdf', 'output.png', function (err) {
    if (err) {
      log(err);
      res.status(500);
      res.json({ error: err });
    } else {
      res.json({ success: true });
    }
  });
});
app.get('/*', function (req, res) {
  log('here');
  res.render('index');
});

var server = app.listen(3010);
log('filepreview server bound to port 3010');