'use strict';

const async = require('async');
const iconv = require('iconv-lite');
const childProcess = require('child_process');
const models = require('../models');
var Company = models.Company;
var Founder = models.Founder;

let pageUrls = new Set(); //存放收集文章页面网站

  // Company.find({'referer':'36Kr', 'founderDetailLink': {$exists: true}}, function (err, companies) {
  //   if (err) return console.error(err);
  //   companies.forEach(function (company, index) {
  //     var link = 'https://rong.36kr.com' + company.toObject().founderDetailLink;
  //     Company.update({founderDetailLink: company.toObject().founderDetailLink}, { founderDetailLink: link }, function (err, doc) {
  //       if (err) console.error(err);
  //       console.log(doc);
  //     });
  //   });
  // });

  // Company.find({'referer':'36Kr', 'raiseFunds.0.organizations.0.link': {$exists: true}}, function (err, companies) {
  //   if (err) return console.error(err);
  //   companies.forEach(function (company, index) {
  //     var raiseFunds = company.toObject().raiseFunds;
  //     raiseFunds.forEach(function (fund, index) {
  //       fund.organizations.forEach(function (org) {
  //         // let pattern = 'https://rong.36kr.comhttps://rong.36kr.com';
  //         // let link = org.link.replace(new RegExp(pattern), '');
  //         org.link = 'https://rong.36kr.com' + org.link;
  //         // org.link = link;
  //       });
  //     });
  //     console.log(company.toObject()._id + '***' + JSON.stringify(raiseFunds));
  //     Company.update({cpyDetailLink: company.toObject().cpyDetailLink}, { raiseFunds: raiseFunds }, function (err, doc) {
  //       if (err) console.error(err);
  //       console.log(doc);
  //     });
  //   });
  // });

Company.find(function (err, companies) {
  if (err) return console.error(err);
  companies.forEach(function (company, index) {
    if (company.toObject().founder && index < 400 && index >= 219) {
      pageUrls.add(company.toObject().founderDetailLink);
    }
  });
  start();
});

let start = function() {
  let concurrencyCount = 0;
  let fetch = function (url, callback) {
    concurrencyCount++;
    console.log('并发量:' + concurrencyCount + '地址:' + url);
    let ls = childProcess.spawn('phantomjs', ['./spider/36kr-phantom-founder.js', url]);
    ls.stdout.on('data', function (data) {
      let str = iconv.decode(data, 'utf-8');
      console.log(str);
      if (str.startsWith('Founder:')) {
        let json = str.substr(8);
        let obj = JSON.parse(json);
        Founder.find({ founderDetailLink: url }, function (err, founders) {
          if (founders[0]) {
            end();
            return;
          } else {
            Founder.create(obj, function (err, founder) {
              if (err) console.error(err);
              Company.find({ founderDetailLink: founder.founderDetailLink }, '_id', function (err, ids) {
                let idList = [];
                ids.forEach(function (item) {
                  idList.push(item._id);
                });
                Company.update({ _id: { $in: idList } }, { founder_id: founder._id }, { multi: true }, function (err, doc) {
                  if (err) console.error(err);
                  end();
                });
              });
            });
          }
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

exports.start = start;
