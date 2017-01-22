const async = require('async');
const iconv = require('iconv-lite');
const childProcess = require('child_process');
const models = require('../models');
var Company = models.Company;

let pageUrls = [], //存放收集文章页面网站
  pageNum = 40, //要爬取文章的页数
  loginUrl = 'https://www.itjuzi.com/user/login?redirect=company?scope=47';
  // ep = new Eventproxy()

// pageUrls.push(loginUrl); // When need login, release annotate
// for (let i = 1; i <= pageNum; i++) {
  // pageUrls.push('http://www.itjuzi.com/company?scope=47&page=' + i);
  // pageUrls.push('http://www.itjuzi.com/company/foreign?scope=47&page=' + i);
// }

pageUrls.push('http://www.itjuzi.com/company/17723');

// Company.find(function (err, companies) {
//   if (err) return console.error(err);
//   companies.forEach(function (company, index) {
//     if (index >= 1972) {
//       pageUrls.push(company.toObject().cpyDetailLink);
//     }
//   });
//   // console.log(pageUrls);
//   start();
// });

let start = function() {
  let concurrencyCount = 0;
  let fetch = function (url, callback) {
    concurrencyCount++;
    console.log('并发量:' + concurrencyCount + '地址:' + url);
    // '--cookies-file=./spider/juzi-cookie.txt',
    let ls = childProcess.spawn('phantomjs', ['--ignore-ssl-errors=true', './spider/juzi-phantom-introduce.js', url]);
    ls.stdout.on('data', function (data) {
      let str = iconv.decode(data, 'utf-8');
      console.log(str);
      if (str.indexOf('login success') > -1) {
        end();
      }
      if (str.startsWith('Data:')) {
        let json = str.substr(5);
        let obj = JSON.parse(json);
        Company.create(obj.data, function (err, companies) {
          if (err) console.error(err);
          end();
        });
      }
      if (str.startsWith('data:')) {
        let json = str.substr(5);
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

// start();

exports.start = start;
