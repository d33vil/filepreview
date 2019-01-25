import express from 'express';
import tracer from 'tracer';
import fpreview from './filepreview';
import multer from 'multer';
import crypto from 'crypto';
import mime from 'mime';
import path from 'path';

let storage = multer.diskStorage({
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype));
    });
  }
});
multer({});
let upload = multer({
  storage,
  limits: { fieldSize: 25 * 1024 * 1024 }
});

global.log = tracer.console().log;
global.info = tracer.console().info;
global.trace = tracer.console().trace;
global.debug = tracer.console().debug;
global.warn = tracer.console().warn;
global.error = tracer.console().error;

let app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.post('/generate', upload.any(), (req, res, next) => {
  let file = (req.files || [])[0];
  if (file) {
    log(file);
    let p = path.parse(file.path);
    let preview = p.dir + '/' + p.name + '.png';
    fpreview.generate(file.path, preview, (err) => {
      if (err) {
        log(err);
        res.status(500);
        res.json({ error: err });
      } else {
        res.sendFile(preview);
      }
    });
  } else {
    res.status(500);
    res.json({ error: 'No File' });
  }
});
app.get('/test', (req, res, next) => {
  fpreview.generate('pdf-test.pdf', 'output.png', (err) => {
    if (err) {
      log(err);
      res.status(500);
      res.json({ error: err });
    } else {
      res.json({ success: true });
    }
  });
});
app.get('/*', function(req, res) {
  res.render('index.html');
});


let server = app.listen(3010);
log('filepreview server bound to port 3010');
