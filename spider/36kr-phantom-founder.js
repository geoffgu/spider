var system = require('system');
var url = system.args[1];
var webpage = require('webpage'), page = webpage.create();
// page.viewportSize = { width: 1024, height: 800 };
// page.clipRect = { top: 0, left: 0, width: 1024, height: 800 };
page.settings = {
  javascriptEnabled: true,
  loadImages: false,
  webSecurityEnabled: false,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
};

phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;

page.customHeaders = {
  'Referer': 'https://rong.36kr.com/'
};

page.onLoadStarted = function () {
  console.log('----------------start-----------------');
};

page.open(url, function(status) {
  if (status === 'success') {
    setTimeout(checkPageReady, 8000);
  } else {
    page.close();
    phantom.exit();
  }

  function checkPageReady() {
    if (page.injectJs('./node_modules/jquery/dist/jquery.min.js')) {
      page.evaluate(function(url) {
        var obj = {};
        obj.founderDetailLink = url;
        obj.name = $('.basic-section .basic-info .user-name > h1').text();
        obj.avatar = $('.basic-section .logo img').attr('src');
        obj.des = $('.basic-section .basic-info .info .ng-binding.ng-scope').text();
        obj.industry = [];
        for (var i = 0, industryLength = $('.basic-section .basic-info .industry .content span').length; i < industryLength; i++) {
          obj.industry.push($('.basic-section .basic-info .industry .content span').eq(i).text());
        }
        obj.founderCases = [];
        obj.workedCases = [];
        for (var j = 0, founderCasesLength = $('.user-container .user-profile > div').length; j < founderCasesLength; j++) {
          if ($('.user-container .user-profile > div').eq(j).attr('ng-include') == '\'templates/user/company.html\'') {
            for (var k = 0, itemLength = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').length; k < itemLength; k++) {
              var founderCase = {};
              founderCase.avatar = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.avatar img').attr('src');
              founderCase.name = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .info-heading a').text();
              founderCase.des = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .intro p').text();
              founderCase.title = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .round').contents().filter(function () {
                return this.nodeType === 3;
              }).text().trim();
              founderCase.time = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .round .date').text().trim();
              obj.founderCases.push(founderCase);
            }
          }
          if ($('.user-container .user-profile > div').eq(j).attr('ng-include') == '\'templates/user/work.html\'') {
            for (var k = 0, itemLength = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').length; k < itemLength; k++) {
              var workedCase = {};
              workedCase.avatar = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.avatar img').attr('src');
              workedCase.name = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .info-heading a').text();
              workedCase.des = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .intro p').text();
              workedCase.title = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .round').contents().filter(function () {
                return this.nodeType === 3;
              }).text().trim();
              workedCase.time = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .round .date').text().trim();
              obj.workedCases.push(workedCase);
            }
          }
        }
        obj.referer = '36Kr';
        console.log('Founder:' + JSON.stringify(obj));
      }, url);
    }
    page.close();
    phantom.exit();
  }
});

page.onConsoleMessage = function (msg) {
  if (msg.indexOf('Founder:') > -1) {
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
