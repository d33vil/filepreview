'use strict';

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _db = require('../db.json');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  generate: function generate(input_original, output, options, callback) {
    // Normalize arguments

    var input = input_original;

    if (typeof options === 'function') {
      callback = options;
      options = {};
    } else {
      options = options || {};
    }

    // Check for supported output format
    var extOutput = _path2.default.extname(output).toLowerCase().replace('.', '');
    var extInput = _path2.default.extname(input).toLowerCase().replace('.', '');

    if (extOutput !== 'gif' && extOutput !== 'jpg' && extOutput !== 'png') {
      return callback(true);
    }

    var fileType = 'other';

    root: for (var index in _db2.default) {
      if ('extensions' in _db2.default[index]) {
        for (var indexExt in _db2.default[index].extensions) {
          if (_db2.default[index].extensions[indexExt] === extInput) {
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
      var url = input.split('/');
      var url_filename = url[url.length - 1];
      var hash = _crypto2.default.createHash('sha512');
      hash.update(Math.random().toString());
      hash = hash.digest('hex');
      var temp_input = _path2.default.join(_os2.default.tmpdir(), hash + url_filename);
      var curlArgs = ['--silent', '-L', input, '-o', temp_input];
      _child_process2.default.execFileSync('curl', curlArgs);
      input = temp_input;
    }

    _fs2.default.lstat(input, function (error, stats) {
      if (error) return callback(error);
      if (!stats.isFile()) {
        return callback(true);
      } else {
        if (fileType === 'video') {
          var ffmpegArgs = ['-y', '-i', input, '-vf', 'thumbnail', '-frames:v', '1', output];
          if (options.width > 0 && options.height > 0) {
            ffmpegArgs.splice(4, 1, 'thumbnail,scale=' + options.width + ':' + options.height);
          }
          _child_process2.default.execFile('ffmpeg', ffmpegArgs, function (error) {
            if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
              _fs2.default.unlinkSync(input);
            }

            if (error) return callback(error);
            return callback();
          });
        }

        if (fileType === 'image') {
          var convertArgs = [input + '[0]', output];
          if (options.width > 0 && options.height > 0) {
            convertArgs.splice(0, 0, '-resize', options.width + 'x' + options.height);
          }
          if (options.quality) {
            convertArgs.splice(0, 0, '-quality', options.quality);
          }
          _child_process2.default.execFile('convert', convertArgs, function (error) {
            if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
              _fs2.default.unlinkSync(input);
            }
            if (error) return callback(error);
            return callback();
          });
        }

        if (fileType === 'other') {
          var _hash = _crypto2.default.createHash('sha512');
          _hash.update(Math.random().toString());
          _hash = _hash.digest('hex');

          var tempPDF = _path2.default.join(_os2.default.tmpdir(), _hash + '.pdf');

          _child_process2.default.execFile('unoconv', ['-e', 'PageRange=1', '-o', tempPDF, input], function (error) {
            if (error) return callback(error);
            var convertOtherArgs = [tempPDF + '[0]', output];
            if (options.width > 0 && options.height > 0) {
              convertOtherArgs.splice(0, 0, '-resize', options.width + 'x' + options.height);
            }
            if (options.quality) {
              convertOtherArgs.splice(0, 0, '-quality', options.quality);
            }
            _child_process2.default.execFile('convert', convertOtherArgs, function (error) {
              if (error) return callback(error);
              _fs2.default.unlink(tempPDF, function (error) {
                if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
                  _fs2.default.unlinkSync(input);
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

  generateSync: function generateSync(input_original, output, options) {
    options = options || {};

    var input = input_original;

    // Check for supported output format
    var extOutput = _path2.default.extname(output).toLowerCase().replace('.', '');
    var extInput = _path2.default.extname(input).toLowerCase().replace('.', '');

    if (extOutput !== 'gif' && extOutput !== 'jpg' && extOutput !== 'png') {
      return false;
    }

    var fileType = 'other';

    root: for (var index in _db2.default) {
      if ('extensions' in _db2.default[index]) {
        for (var indexExt in _db2.default[index].extensions) {
          if (_db2.default[index].extensions[indexExt] === extInput) {
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
      var url = input.split('/');
      var url_filename = url[url.length - 1];
      var hash = _crypto2.default.createHash('sha512');
      hash.update(Math.random().toString());
      hash = hash.digest('hex');
      var temp_input = _path2.default.join(_os2.default.tmpdir(), hash + url_filename);
      var curlArgs = ['--silent', '-L', input, '-o', temp_input];
      _child_process2.default.execFileSync('curl', curlArgs);
      input = temp_input;
    }

    try {
      var stats = _fs2.default.lstatSync(input);

      if (!stats.isFile()) {
        return false;
      }
    } catch (e) {
      return false;
    }

    if (fileType === 'video') {
      try {
        var ffmpegArgs = ['-y', '-i', input, '-vf', 'thumbnail', '-frames:v', '1', output];
        if (options.width > 0 && options.height > 0) {
          ffmpegArgs.splice(4, 1, 'thumbnail,scale=' + options.width + ':' + options.height);
        }
        _child_process2.default.execFileSync('ffmpeg', ffmpegArgs);
        if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
          _fs2.default.unlinkSync(input);
        }
        return true;
      } catch (e) {
        return false;
      }
    }

    if (fileType === 'image') {
      try {
        var convertArgs = [input + '[0]', output];
        if (options.width > 0 && options.height > 0) {
          convertArgs.splice(0, 0, '-resize', options.width + 'x' + options.height);
        }
        if (options.quality) {
          convertArgs.splice(0, 0, '-quality', options.quality);
        }
        _child_process2.default.execFileSync('convert', convertArgs);
        if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
          _fs2.default.unlinkSync(input);
        }
        return true;
      } catch (e) {
        return false;
      }
    }

    if (fileType === 'other') {
      try {
        var _hash2 = _crypto2.default.createHash('sha512');
        _hash2.update(Math.random().toString());
        _hash2 = _hash2.digest('hex');

        var tempPDF = _path2.default.join(_os2.default.tmpdir(), _hash2 + '.pdf');

        _child_process2.default.execFileSync('unoconv', ['-e', 'PageRange=1', '-o', tempPDF, input]);

        var convertOtherArgs = [tempPDF + '[0]', output];
        if (options.width > 0 && options.height > 0) {
          convertOtherArgs.splice(0, 0, '-resize', options.width + 'x' + options.height);
        }
        if (options.quality) {
          convertOtherArgs.splice(0, 0, '-quality', options.quality);
        }
        _child_process2.default.execFileSync('convert', convertOtherArgs);
        _fs2.default.unlinkSync(tempPDF);
        if (input_original.indexOf('http://') === 0 || input_original.indexOf('https://') === 0) {
          _fs2.default.unlinkSync(input);
        }
        return true;
      } catch (e) {
        return false;
      }
    }
  }
};