const async = require('async');
const iconv = require('iconv-lite');
const childProcess = require('child_process');
const models = require('../models');
var Company = models.Company;

let pageUrls = new Set(); //存放收集文章页面网站

// pageUrls.add('https://www.crunchbase.com/category/health-care/3f21415b-5784-6be6-3722-eb189190b7cd');
pageUrls.add('http://192.168.3.189/act/test.html');

let start = function() {
  let concurrencyCount = 0;
  let fetch = function (url, callback) {
    concurrencyCount++;
    console.log('并发量:' + concurrencyCount + '地址:' + url);
    let ls = childProcess.spawn('phantomjs', ['./spider/crunchbase-phantom-introduce.js', url]);
    let count = 90;
    ls.stdout.on('data', function (data) {
      let str = iconv.decode(data, 'utf-8');
      console.log(str);
      if (str.startsWith('Company:')) {
        let json = str.substr(8);
        let obj = JSON.parse(json);
        count++;
        Company.create(obj, function (err, companies) {
          if (err) console.error(err);
          console.log(count);
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

start();

exports.start = start;
