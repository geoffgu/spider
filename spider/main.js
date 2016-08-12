'use strict';

const Superagent = require('superagent');
const Cheerio = require('cheerio');
const Async = require('async');
const Eventproxy = require('eventproxy');
const Iconv = require('iconv-lite');
const Socks5 = require('socks5-http-client/lib/Agent');
const Request = require('request');

let ep = new Eventproxy(),
  pageUrls = [], //存放收集文章页面网站
  pageNum = 5, //要爬取文章的页数
  data = []; //具体数据

// let cookie = 'd_c0="AADAHrwBFgqPTiXz65i0fnRa33Sk_UIB9kw=|1466055541"; _zap=f1df6840-b1ba-41d1-ba66-2fb3a12bab10; q_c1=6c82b984feea4bffa110395befe01ce1|1469765241000|1469765241000; _xsrf=2|db2ae675|1a301c2a73e891b3b692c01cbc0bd832|1469765601; l_n_c=1; l_cap_id="OGQ1YjU1MzMwMWY0NGI0NmJjNTMwMWVmZDJmMjk4N2Y=|1470988231|967e174dd2fc6a90a354d7c22ab31bb13a540266"; cap_id="NzhlM2E3YzQ2ODFhNGEyNzlhOWRkYzQ2ZjRiYzliNmE=|1470988231|96e1fd539718bba71ea23f0e693faa15cac402a6"; login="OWYwMmU3ZmU3MmQzNDE3ZmIxM2Q2YTMyMzUxN2Q0ZWM=|1470988250|83c7d4642034531ee0b50391285fd7fea63e43e0"; unlock_ticket="QUJDSzNKcU1lZ2dYQUFBQVlRSlZUU21IclZjWEV4ZGZVYV9xQjNXSXBlUTZGQmwtMmlkb19BPT0=|1470988321|2d73330eed3c7cd9fa455fa18b99b9d8c6f7fc98"; __utmt=1; a_t="2.0ABCK3JqMeggXAAAAgRLVVwAQityajHoIAADAHrwBFgoXAAAAYQJVTSEN1VcA6dGztpV9kEsrIA6YnyLkLmWnv2S-dVEIOldYtLCZhkxb0Xwc9WXOhw=="; z_c0=Mi4wQUJDSzNKcU1lZ2dBQU1BZXZBRVdDaGNBQUFCaEFsVk5JUTNWVndEcDBiTzJsWDJRU3lzZ0RwaWZJdVF1WmFlX1pB|1470989697|fd7608847de0caab45bd0507a2df13b7dbdcf2ab; __utma=155987696.1421293655.1470989603.1470989603.1470989603.1; __utmb=155987696.8.10.1470989603; __utmc=155987696; __utmz=155987696.1470989603.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); XSRF-TOKEN=2|6277ea1e|a36d1041cab59dd80fcfcc770556d459|1469765601';

for (let i = 2; i <= pageNum; i++) {
  // pageUrls.push('http://china.ynet.com/3.1/1608/09/11575118_' + i + '.html');
  // pageUrls.push('http://www.itjuzi.com/company?scope=47&page=' + i);
  pageUrls.push('https://www.zhihu.com/question/2550435' + i);
}

let start = function() {
  let concurrencyCount = 0;
  let fetch = function (url, callback) {
    concurrencyCount++;
    console.log('并发量:' + concurrencyCount + '地址:' + url);
    // Request({
    //     url: url,
    //     agentClass: Socks5,
    //     agentOptions: {
    //         socksHost: '101.201.109.28', // Defaults to 'localhost'.
    //         socksPort: 25822, // Defaults to 1080.
    //         socksUsername: 'duotai',
    //         socksPassword: 'xE6lX2wjI'
    //     }
    // }, function(err, res) {
    //   concurrencyCount--;
    //   console.log(err + '***' + res.body);
    //   callback(null, url);
    //   let str;
    //   if (Iconv.encodingExists('gbk')) {
    //     str = Iconv.decode(new Buffer(res.text), 'gbk');
    //   }
    //   console.log(str);
    //   let $ = Cheerio.load(str);
    //   let cpTitle = $('p.title');
    //   data.push(cpTitle);
    // });
    Superagent.get(url)
      // .set('Cookie', cookie)
      .end(function(err, res) {
        concurrencyCount--;
        let str;
        if (Iconv.encodingExists('utf-8')) {
          str = Iconv.decode(new Buffer(res.text), 'utf-8');
        }
        console.log(str);
        let $ = Cheerio.load(str);
        let cpTitle = $('nav a');
        data.push(cpTitle);
        callback(null, url);
      });
  };

  Async.mapLimit(pageUrls, 1, function(url, callback) {
    fetch(url, callback);
  }, function(err, result) {
    console.log('*****' + data);
  });
}

start();

exports.start = start;
