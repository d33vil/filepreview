import child_process from 'child_process';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import os from 'os';
import mimedb from '../db.json';

module.exports = {
  generate: function(input_original, output, options, callback) {
    // Normalize arguments

    let input = input_original;

    if (typeof options === 'function') {
      callback = options;
      options = {};
    } else {
      options = options || {};
    }

    // Check for supported output format
    let extOutput = path
      .extname(output)
      .toLowerCase()
      .replace('.', '');
    let extInput = path
      .extname(input)
      .toLowerCase()
      .replace('.', '');

    if (extOutput !== 'gif' && extOutput !== 'jpg' && extOutput !== 'png') {
      return callback(true);
    }

    let fileType = 'other';

    root: for (let index in mimedb) {
      if ('extensions' in mimedb[index]) {
        for (let indexExt in mimedb[index].extensions) {
          if (mimedb[index].extensions[indexExt] === extInput) {
            if (index.split('/')[0] === 'image') {
              fileType = 'image';
            } else if (index.split('/')[0] === 'video') {
              fileType = 'video';
            } else {
              fileType = 'other';
            }

            break root;
          }
        }
      }
    }

    if (extInput === 'pdf') {
      fileType = 'image';
    }

    if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
      let url = input.split('/');
      let url_filename = url[url.length - 1];
      let hash = crypto.createHash('sha512');
      hash.update(Math.random().toString());
      hash = hash.digest('hex');
      let temp_input = path.join(os.tmpdir(), hash + url_filename);
      let curlArgs = ['--silent', '-L', input, '-o', temp_input];
      child_process.execFileSync('curl', curlArgs);
      input = temp_input;
    }

    fs.lstat(input, function(error, stats) {
      if (error) return callback(error);
      if (!stats.isFile()) {
        return callback(true);
      } else {
        if (fileType === 'video') {
          let ffmpegArgs = ['-y', '-i', input, '-vf', 'thumbnail', '-frames:v', '1', output];
          if (options.width > 0 && options.height > 0) {
            ffmpegArgs.splice(4, 1, 'thumbnail,scale=' + options.width + ':' + options.height);
          }
          child_process.execFile('ffmpeg', ffmpegArgs, function(error) {
            if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
              fs.unlinkSync(input);
            }

            if (error) return callback(error);
            return callback();
          });
        }

        if (fileType === 'image') {
          let convertArgs = [input + '[0]', output];
          if (options.width > 0 && options.height > 0) {
            convertArgs.splice(0, 0, '-resize', options.width + 'x' + options.height);
          }
          if (options.quality) {
            convertArgs.splice(0, 0, '-quality', options.quality);
          }
          child_process.execFile('convert', convertArgs, function(error) {
            if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
              fs.unlinkSync(input);
            }
            if (error) return callback(error);
            return callback();
          });
        }

        if (fileType === 'other') {
          let hash = crypto.createHash('sha512');
          hash.update(Math.random().toString());
          hash = hash.digest('hex');

          let tempPDF = path.join(os.tmpdir(), hash + '.pdf');

          child_process.execFile('unoconv', ['-e', 'PageRange=1-2', '-o', tempPDF, input], function(error) {
            if (error) return callback(error);
            let convertOtherArgs = [tempPDF + '[0]', output];
            if (options.width > 0 && options.height > 0) {
              convertOtherArgs.splice(0, 0, '-resize', options.width + 'x' + options.height);
            }
            if (options.quality) {
              convertOtherArgs.splice(0, 0, '-quality', options.quality);
            }
            child_process.execFile('convert', convertOtherArgs, function(error) {
              if (error) return callback(error);
              fs.unlink(tempPDF, function(error) {
                if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
                  fs.unlinkSync(input);
                }
                if (error) return callback(error);
                return callback();
              });
            });
          });
        }
      }
    });
  },

  generateSync: function(input_original, output, options) {
    options = options || {};

    let input = input_original;

    // Check for supported output format
    let extOutput = path
      .extname(output)
      .toLowerCase()
      .replace('.', '');
    let extInput = path
      .extname(input)
      .toLowerCase()
      .replace('.', '');

    if (extOutput !== 'gif' && extOutput !== 'jpg' && extOutput !== 'png') {
      return false;
    }

    let fileType = 'other';

    root: for (let index in mimedb) {
      if ('extensions' in mimedb[index]) {
        for (let indexExt in mimedb[index].extensions) {
          if (mimedb[index].extensions[indexExt] === extInput) {
            if (index.split('/')[0] === 'image') {
              fileType = 'image';
            } else if (index.split('/')[0] === 'video') {
              fileType = 'video';
            } else {
              fileType = 'other';
            }

            break root;
          }
        }
      }
    }

    if (extInput === 'pdf') {
      fileType = 'image';
    }

    if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
      let url = input.split('/');
      let url_filename = url[url.length - 1];
      let hash = crypto.createHash('sha512');
      hash.update(Math.random().toString());
      hash = hash.digest('hex');
      let temp_input = path.join(os.tmpdir(), hash + url_filename);
      let curlArgs = ['--silent', '-L', input, '-o', temp_input];
      child_process.execFileSync('curl', curlArgs);
      input = temp_input;
    }

    try {
      let stats = fs.lstatSync(input);

      if (!stats.isFile()) {
        return false;
      }
    } catch (e) {
      return false;
    }

    if (fileType === 'video') {
      try {
        let ffmpegArgs = ['-y', '-i', input, '-vf', 'thumbnail', '-frames:v', '1', output];
        if (options.width > 0 && options.height > 0) {
          ffmpegArgs.splice(4, 1, 'thumbnail,scale=' + options.width + ':' + options.height);
        }
        child_process.execFileSync('ffmpeg', ffmpegArgs);
        if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
          fs.unlinkSync(input);
        }
        return true;
      } catch (e) {
        return false;
      }
    }

    if (fileType === 'image') {
      try {
        let convertArgs = [input + '[0]', output];
        if (options.width > 0 && options.height > 0) {
          convertArgs.splice(0, 0, '-resize', options.width + 'x' + options.height);
        }
        if (options.quality) {
          convertArgs.splice(0, 0, '-quality', options.quality);
        }
        child_process.execFileSync('convert', convertArgs);
        if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
          fs.unlinkSync(input);
        }
        return true;
      } catch (e) {
        return false;
      }
    }

    if (fileType === 'other') {
      try {
        let hash = crypto.createHash('sha512');
        hash.update(Math.random().toString());
        hash = hash.digest('hex');

        let tempPDF = path.join(os.tmpdir(), hash + '.pdf');

        child_process.execFileSync('unoconv', ['-e', 'PageRange=1', '-o', tempPDF, input]);

        let convertOtherArgs = [tempPDF + '[0]', output];
        if (options.width > 0 && options.height > 0) {
          convertOtherArgs.splice(0, 0, '-resize', options.width + 'x' + options.height);
        }
        if (options.quality) {
          convertOtherArgs.splice(0, 0, '-quality', options.quality);
        }
        child_process.execFileSync('convert', convertOtherArgs);
        fs.unlinkSync(tempPDF);
        if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
          fs.unlinkSync(input);
        }
        return true;
      } catch (e) {
        return false;
      }
    }
  }
};
