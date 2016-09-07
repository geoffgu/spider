var system = require('system');
var url = system.args[1];
var webpage = require('webpage'), page = webpage.create();
var stepIndex = 0;

phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;

page.settings = {
  javascriptEnabled: true,
  loadImages: false,
  webSecurityEnabled: false,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
};

page.customHeaders = {
  'Referer': 'http://www.itjuzi.com/company?scope=47'
};

page.onLoadStarted = function () {
  console.log('----------------start-----------------');
};

page.onConsoleMessage = function (msg) {
  if (msg.indexOf('{\"data\":') > -1) {
    console.log('Data:' + msg);
  } else {
    console.log(msg);
  }
}

page.onError = function (msg, trace) {
  var msgStack = ['ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }
  console.error(msgStack.join('\n'));
};

page.open(url, function(status) {
  if (status === 'success') {
    if (url == 'https://www.itjuzi.com/user/login?redirect=company?scope=47') {
      setTimeout(loginPage, 8000);
    } else {
      // setTimeout(checkPageReady, 8000);
      setTimeout(checkPageDetail, 8000);
    }
  } else {
    page.close();
    phantom.exit();
  }

  function loginPage () {
    if (page.injectJs('./node_modules/jquery/dist/jquery.min.js')) {
      var steps = [
        function () {
          //Enter username
          page.evaluate(function () {
            $("input[name='identity']").trigger( "focus" );
          });
          page.sendEvent('keypress', 'wangpanpan@geekheal.com');
        },
        function () {
          //Enter password
          page.evaluate(function () {
            $("input[name='password']").trigger( "focus" );
          });
          page.sendEvent('keypress', '100200');
        },
        function () {
          //Login
          page.evaluate(function() {
            $(".row-btn > button").trigger( "click" );
          });
        },
        function () {
          //Get redirected page cookie
          var cookies = page.cookies;
          for(var i = 0, length = cookies.length; i < length; i++) {
            phantom.addCookie(cookies[i]);
          }
        }
      ];

      var interval = setInterval(function () {
        if (typeof steps[stepIndex] == 'function') {
          console.log('step ' + (stepIndex + 1));
          steps[stepIndex]();
          stepIndex++;
        } else {
          console.log('------steps complete------');
          clearInterval(interval);
          page.evaluate(function () {
            console.log('login success');
          });
          page.close();
          phantom.exit();
        }
      }, 5000);
    } else {
      console.log('cannot load jquery');
      page.close();
      phantom.exit();
    }
  }

  function checkPageReady () {
    if (page.injectJs('./node_modules/jquery/dist/jquery.min.js')) {
      page.evaluate(function() {
        var array = { 'data': [] };
        for (var i = 0, length = $('.list-main-icnset:not(.thead) li').length; i < length; i++) {
          var obj = {};
          var $currentEle = $('.list-main-icnset:not(.thead) li').eq(i);
          obj.name = $currentEle.find('.cell.maincell .title span').text();
          obj.cpyDetailLink = $currentEle.find('.cell.maincell .title a').attr('href');
          obj.avatar = $currentEle.find('.cell.pic img').attr('src');
          obj.time = $currentEle.find('.cell.date').text().trim();
          obj.des = $currentEle.find('.cell.maincell .des span').text();
          obj.industry = $currentEle.find('.tags.t-small.c-gray-aset a').text();
          obj.location = $currentEle.find('.cell.maincell .loca.c-gray-aset a').text();
          obj.round = $currentEle.find('.cell.round span').text();
          obj.isForeign = 1;
          obj.referer = 'IT桔子';
          array.data.push(obj);
        }
        console.log(JSON.stringify(array));
      });
      page.close();
      phantom.exit();
    } else {
      console.log('cannot load jquery');
      page.close();
      phantom.exit();
    }
  }

  function checkPageDetail () {
    if (page.injectJs('./node_modules/jquery/dist/jquery.min.js')) {
      page.evaluate(function() {
        var obj = {};
        obj.avatar = $('.infoheadrow-v2.ugc-block-item .pic img').attr('src');
        obj.slogan = $('.info-line > p').text().trim();
        obj.tags = [];
        for (var i = 0, tagLength = $('.tagset.dbi.c-gray-aset > a').length; i < tagLength; i++) {
          obj.tags.push($('.tagset.dbi.c-gray-aset > a').eq(i).find('span').text());
        }
        obj.location = '';
        for (var j = 0, locaLength = $('.loca.c-gray-aset a').length; j < locaLength; j++) {
          obj.location += $('.loca.c-gray-aset a').eq(j).text() + ' ';
        }
        obj.location = obj.location.trim();
        obj.website = $('.link-line .weblink').text().trim();
        // if ($('.bread li').eq(1).find('a').text() == '国内公司') {
        //   obj.isForeign = 0;
        // } else {
        //   obj.isForeign = 1;
        // }
        obj.fullName = $('.des-more div').eq(0).find('span').text().trim();
        obj.scale = $('.des-more div').eq(1).find('span').eq(1).text().trim();
        obj.status = $('.des-more div').eq(2).find('.tag').text().trim();
        obj.raiseFunds = [];
        for (var m = 0, raiseLength = $('.list-round-v2 tbody > tr').length; m < raiseLength; m++) {
          var fund = {};
          fund.times = $('.list-round-v2 tbody > tr').eq(m).find('.date.c-gray').text();
          fund.phace = $('.list-round-v2 tbody > tr').eq(m).find('.mobile-none .round a').text();
          fund.amount = $('.list-round-v2 tbody > tr').eq(m).find('.finades a').text();
          fund.organizations = [];
          for (var n = 0, orgLength = $('.list-round-v2 tbody > tr').eq(m).find('td:last-child a').length; n < orgLength; n++) {
            var org = {};
            org.name = $('.list-round-v2 tbody > tr').eq(m).find('td:last-child a').eq(n).text();
            org.link = $('.list-round-v2 tbody > tr').eq(m).find('td:last-child a').eq(n).attr('href');
            fund.organizations.push(org);
          }
          obj.raiseFunds.push(fund);
        }
        obj.founder = $('.list-prodcase li').eq(0).find('.right .person-name a b span').eq(0).text();
        obj.founderRank = $('.list-prodcase li').eq(0).find('.right .person-name a b span').eq(1).text();
        obj.founderDetailLink = $('.list-prodcase li').eq(0).find('.right .person-name a').attr('href');
        obj.products = [];
        for (var k = 0, proLength = $('.list-prod li').length; k < proLength; k++) {
          var product = {};
          product.tag = $('.list-prod li').eq(k).find('.on-edit-hide h4 .tag').text();
          product.name = $('.list-prod li').eq(k).find('.on-edit-hide h4 b a').text();
          product.link = $('.list-prod li').eq(k).find('.on-edit-hide h4 b a').attr('href');
          product.desc = $('.list-prod li').eq(k).find('.on-edit-hide p').text();
          obj.products.push(product);
        }
        console.log('data:' + JSON.stringify(obj));
      });
      page.close();
      phantom.exit();
    } else {
      console.log('cannot load jquery');
      page.close();
      phantom.exit();
    }
  }
});
