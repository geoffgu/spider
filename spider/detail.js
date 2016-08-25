'use strict';

const async = require('async');
const iconv = require('iconv-lite');
const childProcess = require('child_process');
const models = require('../models');
var Company = models.Company;

let pageUrls = [], //存放收集文章页面网站
  pageNum = 1, //要爬取文章的页数
  loginUrl = 'https://passport.36kr.com/pages/?ok_url=http%3A%2F%2F36kr.com%2F#/login?pos=header';
  // ep = new Eventproxy()

// pageUrls.push(loginUrl); // When need login, release annotate
Company.find(function (err, companies) {
  if (err) return console.error(err);
  companies.forEach(function (company, index) {
    pageUrls.push('https://rong.36kr.com' + company.toObject().cpyDetailLink);
  });
  start();
});

let start = function() {
  let concurrencyCount = 0;
  let fetch = function (url, callback) {
    concurrencyCount++;
    console.log('并发量:' + concurrencyCount + '地址:' + url);
    let ls = childProcess.spawn('phantomjs', ['--cookies-file=./spider/cookie.txt', './spider/phantom-detail.js', url]);
    ls.stdout.on('data', function (data) {
      let str = iconv.decode(data, 'utf-8');
      console.log(str);
      if (str.indexOf('login success') > -1) {
        end();
      }
      if (str.startsWith('data:')) {
        let json = str.substr(5);
        let obj = JSON.parse(json);
        end();
      }
    });

    ls.stderr.on('data', function (data) {
      console.log('***stderr: ' + data);
      end();
    });

    ls.on('close', function (code) {
      console.log('node child process close');
    });

    function end () {
      concurrencyCount--;
      ls.kill();
      callback(null, url);
    }
  };

  async.mapLimit(pageUrls, 1, function(url, callback) {
    fetch(url, callback);
  }, function(err, result) {
    console.log('***async done***');
  });
}

exports.start = start;
