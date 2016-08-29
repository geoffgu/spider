'use strict';

// const superagent = require('superagent');
// const cheerio = require('cheerio');
// const Eventproxy = require('eventproxy');
// const Socks5 = require('socks5-http-client/lib/Agent');
// const Request = require('request');
const async = require('async');
const iconv = require('iconv-lite');
const childProcess = require('child_process');
const models = require('../models');
var Company = models.Company;

let pageUrls = [], //存放收集文章页面网站
  pageNum = 20, //要爬取文章的页数
  data = []; //具体数据
  // ep = new Eventproxy()

for (let i = 1; i <= pageNum; i++) {
  pageUrls.push('https://rong.36kr.com/company/list/?isfinaceStatus=0&page=' + i + '&go=0&industry=MEDICAL_HEALTH&sec_industry=');
}

let start = function() {
  let concurrencyCount = 0;
  let fetch = function (url, callback) {
    concurrencyCount++;
    console.log('并发量:' + concurrencyCount + '地址:' + url);
    let ls = childProcess.spawn('phantomjs', ['./spider/36kr-phantom-introduce.js', url]);
    ls.stdout.on('data', function (data) {
      let str = iconv.decode(data, 'utf-8');
      console.log(str);
      if (str.startsWith('Data:')) {
        let json = str.substr(5);
        let obj = JSON.parse(json);
        Company.create(obj.data, function (err, companies) {
          if (err) console.error(err);
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

start();

exports.start = start;
