import express from 'express';
import tracer from 'tracer';
import fpreview from './filepreview';

global.log = tracer.console().log;
global.info = tracer.console().info;
global.trace = tracer.console().trace;
global.debug = tracer.console().debug;
global.warn = tracer.console().warn;
global.error = tracer.console().error;

let app = express();

app.post('preview', (req, res, next) => {
  log('here');
});

let server = app.listen(3010);
log('filepreview server bound to port 3010');
fpreview.generate('pdf-test.pdf', 'output.png', (err) => {
  log(err);
});
