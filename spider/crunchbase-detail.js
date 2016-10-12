'use strict';

const async = require('async');
const iconv = require('iconv-lite');
const childProcess = require('child_process');
const models = require('../models');
var Company = models.Company;

let pageUrls = new Set(); //存放收集文章页面网站
let count = 1255;

// pageUrls.add('https://www.crunchbase.com/app/login');
Company.find({ 'referer': 'crunchbase', 'cpyDetailLink': { $exists: true } }, function (err, companies) {
  if (err) return console.error(err);
  companies.forEach(function (company, index) {
    if (index >= 1255) {
      pageUrls.add(company.toObject().cpyDetailLink);
    }
  });
  // console.log(pageUrls);
  start();
});

let start = function() {
  let concurrencyCount = 0;
  let fetch = function (url, callback) {
    concurrencyCount++;
    console.log('并发量:' + concurrencyCount + '地址:' + url);
    let ls = childProcess.spawn('phantomjs', ['--cookies-file=./spider/crunchbase-cookie.txt', './spider/crunchbase-phantom-detail.js', url]);
    ls.stdout.on('data', function (data) {
      let str = iconv.decode(data, 'utf-8');
      console.log(str);
      if (str.indexOf('login success') > -1) {
        end();
      }
      if (str.startsWith('Company:')) {
        let json = str.substr(8);
        let obj = JSON.parse(json);
        Company.find({ cpyDetailLink: url }, '_id', function (err, id) {
          Company.update({ _id: id[0]._id }, obj, function (err, doc) {
            if (err) console.error(err);
            end();
          });
        });
      }
    });

    ls.stderr.on('data', function (data) {
      console.log('***stderr: ' + data);
      end();
    });

    ls.on('close', function (code) {
      console.log('node child process close');
      console.log('current index:' + count);
      count++;
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

// start();

exports.start = start;
