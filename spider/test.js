var fs = require('fs');
var path = require('path');
var async = require('async');
var iconv = require('iconv-lite');
var childProcess = require('child_process');

var pageUrls = [];

function readLines(input, func) {
  var remaining = '';
  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      func(line);
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
    } else {
      start();
    }
  });
}

function func(data) {
  pageUrls.push(data.trim());
}

var input = fs.createReadStream(__dirname + '/invest_qi.txt');
readLines(input, func);

var start = function() {
  var concurrencyCount = 0;
  var fetch = function (url, callback) {
    concurrencyCount++;
    console.log('并发量:' + concurrencyCount + '地址:' + url);
    var ls = childProcess.spawn('phantomjs', ['--ignore-ssl-errors=true', './spider/test-phantom.js', url]);
    ls.stdout.on('data', function (data) {
      var str = iconv.decode(data, 'utf-8');
      console.log(str);
      if (str.startsWith('data:')) {
        var json = str.substr(5);
        fs.appendFile(path.join(__dirname, '/test.json'), json, function(err) {
          if (err) throw err;
          end();
        });
      }
    });

    ls.stderr.on('data', function (data) {
      console.log('***stderr: ' + data);
      end();
    });

    ls.on('close', function (code) {
      console.log('node child process close');
      callback(null, url);
    });

    function end () {
      concurrencyCount--;
      ls.kill();
    }
  };

  async.mapLimit(pageUrls, 1, function(url, callback) {
    fetch(url, callback);
  }, function(err, result) {
    console.log('***async done***');
  });
}

exports.start = start;
