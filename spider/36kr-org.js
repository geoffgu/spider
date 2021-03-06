const async = require('async');
const iconv = require('iconv-lite');
const childProcess = require('child_process');
const models = require('../models');
var Company = models.Company;
var Founder = models.Founder;
var Invest = models.Invest;

let pageUrls = new Set(); //存放收集文章页面网站

// pageUrls.add('https://rong.36kr.com/organization/396');

Company.find({'referer':'36Kr', 'raiseFunds.0.organizations.0.link': {$exists: true}}, function (err, companies) {
  if (err) return console.error(err);
  companies.forEach(function (company, index) {
    var raiseFunds = company.toObject().raiseFunds;
    raiseFunds.forEach(function (fund, index) {
      fund.organizations.forEach(function (org) {
        pageUrls.add(org.link);
      });
    });
  });
  start();
});

let start = function() {
  let concurrencyCount = 0;
  let fetch = function (url, callback) {
    concurrencyCount++;
    console.log('并发量:' + concurrencyCount + '地址:' + url);
    let ls = childProcess.execFile('phantomjs', ['--cookies-file=./spider/36kr-cookie.txt', './spider/36kr-phantom-org.js', url], { maxBuffer: 1024 * 1024 * 5 });
    let json1 = '', flag = false;
    ls.stdout.on('data', function (data) {
      let str = iconv.decode(new Buffer(data), 'utf-8').trim();
      console.log(str);
      if (str.startsWith('org:') && str.endsWith(':org')) {
        doSQL(JSON.parse(str.substr(4, str.length - 8)));
      } else if (str.startsWith('org:') && !str.endsWith(':org')) {
        json1 += str.substr(4, str.length - 4);
        flag = true;
      } else if (!str.startsWith('org:') && !str.endsWith(':org') && flag) {
        json1 += str.substr(0, str.length);
      } else if (!str.startsWith('org:') && str.endsWith(':org')) {
        json1 += str.substr(0, str.length - 4);
        // console.log('Complete:' + json1);
        flag = false;
        doSQL(JSON.parse(json1));
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

    function doSQL (obj) {
      Invest.create(obj, function (err, invest) {
        if (err) console.error(err);
        Company.find({ 'raiseFunds.organizations.link': invest.investDetailLink }, function (err, companiesNeedUpdate) {
          if (err) console.error(err);
          companiesNeedUpdate.forEach(function (company) {
            var raiseFunds = company.toObject().raiseFunds;
            raiseFunds.forEach(function (fund, i) {
              fund.organizations.forEach(function (org, j) {
                if (org.link == invest.investDetailLink) {
                  raiseFunds[i].organizations[j].invest_id = invest._id;
                  Company.update({ _id: company.toObject()._id }, { raiseFunds: raiseFunds }, function (err, doc) {
                    if (err) console.error(err);
                  });
                }
              });
            });
          });
          end();
        });
      });
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
